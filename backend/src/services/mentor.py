import json
import uuid
from typing import AsyncGenerator
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from langchain_core.messages import HumanMessage, AIMessage

from src.models.user import User
from src.models.mentor import MentorConversation, MentorMessage
from src.models.skill_gap import SkillGapReport
from src.models.roadmap import CareerRoadmap
from src.schemas.mentor import ChatRequest, ConversationResponse, ConversationBrief, ProactiveSuggestion
from src.ai.mentor import stream_mentor_response, build_mentor_graph
from src.ai.graph_runner import run_graph
from src.ai.graph_state import AgentState
from src.services.reviews import get_aggregate


async def _build_context(db: AsyncSession, user: User) -> dict:
    """Assemble full context: profile + skills + gap reports + roadmaps + review scores."""
    # Gap reports
    gap_rows = await db.scalars(select(SkillGapReport).where(SkillGapReport.user_id == user.id))
    gap_reports = [
        {
            "target_role": r.target_role,
            "missing_skills": json.loads(r.missing_skills),
            "present_skills": json.loads(r.present_skills),
            "estimated_weeks": r.estimated_weeks,
        }
        for r in gap_rows.all()
    ]

    # Latest roadmap per role
    roadmap_rows = await db.scalars(
        select(CareerRoadmap)
        .where(CareerRoadmap.user_id == user.id)
        .order_by(CareerRoadmap.target_role, CareerRoadmap.version.desc())
    )
    seen_roles: set[str] = set()
    roadmaps = []
    for r in roadmap_rows.all():
        if r.target_role not in seen_roles:
            seen_roles.add(r.target_role)
            roadmaps.append({"target_role": r.target_role, "total_weeks": r.total_weeks, "version": r.version})

    # Aggregate review scores
    agg = await get_aggregate(db, user.id)

    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "university": user.university,
        "role": user.role,
        "headline": user.headline,
        "bio": user.bio,
        "skills": [s.name for s in (user.skills or [])],
        "gap_reports": gap_reports,
        "roadmaps": roadmaps,
        "aggregate_scores": agg.model_dump(),
    }


async def _get_or_create_conversation(
    db: AsyncSession, user: User, conversation_id: str | None
) -> MentorConversation:
    if conversation_id:
        conv = await db.get(MentorConversation, conversation_id)
        if not conv or conv.user_id != user.id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conv

    conv = MentorConversation(id=str(uuid.uuid4()), user_id=user.id)
    db.add(conv)
    await db.flush()
    return conv


async def _load_history(conv: MentorConversation) -> list:
    """Convert stored messages to LangChain message objects."""
    history = []
    for m in conv.messages:
        if m.role == "user":
            history.append(HumanMessage(content=m.content))
        else:
            history.append(AIMessage(content=m.content))
    return history


async def _persist_messages(
    db: AsyncSession, conv: MentorConversation, user_content: str, assistant_content: str
) -> None:
    db.add(MentorMessage(
        id=str(uuid.uuid4()), conversation_id=conv.id, role="user", content=user_content
    ))
    db.add(MentorMessage(
        id=str(uuid.uuid4()), conversation_id=conv.id, role="assistant", content=assistant_content
    ))
    # Auto-title from first user message
    if not conv.messages or len(conv.messages) == 0:
        conv.title = user_content[:80] + ("..." if len(user_content) > 80 else "")
    await db.commit()
    await db.refresh(conv)


async def stream_chat(
    db: AsyncSession, user: User, req: ChatRequest
) -> AsyncGenerator[str, None]:
    context = await _build_context(db, user)
    conv = await _get_or_create_conversation(db, user, req.conversation_id)
    history = await _load_history(conv)

    state: AgentState = {
        "messages": history + [HumanMessage(content=req.message)],
        "user_id": user.id,
        "context": context,
        "output": None,
    }

    # Yield conversation_id first so client knows which conversation to track
    import json as _json
    yield f"data: {_json.dumps({'conversation_id': conv.id})}\n\n"

    full_reply = []
    async for chunk in stream_mentor_response(state):
        # Collect content for persistence
        try:
            payload = _json.loads(chunk.removeprefix("data: ").strip())
            if payload.get("content"):
                full_reply.append(payload["content"])
        except Exception:
            pass
        yield chunk

    await _persist_messages(db, conv, req.message, "".join(full_reply))


async def get_conversation(db: AsyncSession, user: User, conversation_id: str) -> ConversationResponse:
    conv = await db.get(MentorConversation, conversation_id)
    if not conv or conv.user_id != user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationResponse.model_validate(conv)


async def list_conversations(db: AsyncSession, user: User) -> list[ConversationBrief]:
    result = await db.scalars(
        select(MentorConversation)
        .where(MentorConversation.user_id == user.id)
        .order_by(MentorConversation.updated_at.desc())
    )
    return [ConversationBrief.model_validate(c) for c in result.all()]


async def delete_conversation(db: AsyncSession, user: User, conversation_id: str) -> None:
    conv = await db.get(MentorConversation, conversation_id)
    if not conv or conv.user_id != user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.delete(conv)
    await db.commit()


async def get_proactive_suggestions(db: AsyncSession, user: User) -> list[ProactiveSuggestion]:
    """Generate on-login proactive suggestions based on profile state."""
    from src.ai.nim_client import chat_completion

    context = await _build_context(db, user)
    has_gap = bool(context["gap_reports"])
    has_roadmap = bool(context["roadmaps"])
    has_skills = bool(context["skills"])

    prompt = (
        f"Student: {context['first_name']}, skills: {', '.join(context['skills']) or 'none'}, "
        f"gap reports: {len(context['gap_reports'])}, roadmaps: {len(context['roadmaps'])}, "
        f"reviews: {context['aggregate_scores']['total_reviews']}.\n\n"
        "Generate 2-3 short proactive career suggestions for this student right now. "
        "Return a JSON array where each item has: "
        '{"type": "next_step"|"opportunity"|"reminder", "message": string, '
        '"action_label": string|null, "action_url": string|null}. '
        "Keep each message under 20 words. No explanation outside the JSON."
    )

    raw = await chat_completion([{"role": "user", "content": prompt}], temperature=0.5, max_tokens=512)
    try:
        items = json.loads(raw)
        return [ProactiveSuggestion(**item) for item in items]
    except Exception:
        return []
