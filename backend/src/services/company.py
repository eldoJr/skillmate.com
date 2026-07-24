import json
import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User
from src.models.company import CompanyRequirement
from src.schemas.company import RequirementCreate, RequirementResponse, CandidateResult, MatchResponse
from src.schemas.user import PublicUserResponse
from src.ai.vector_search import cosine_search
from src.ai.company_matching import embed_requirement, generate_candidate_summaries
from src.ai.recommendation import compute_final_score, reputation_signal, activity_signal
from src.services.reviews import get_aggregate


async def post_requirement(
    db: AsyncSession, user: User, data: RequirementCreate
) -> RequirementResponse:
    embedding = await embed_requirement(
        data.role_title, data.description, data.required_skills
    )
    req = CompanyRequirement(
        id=str(uuid.uuid4()),
        posted_by=user.id,
        company_name=data.company_name,
        role_title=data.role_title,
        description=data.description,
        required_skills=json.dumps(data.required_skills),
        preferred_university=data.preferred_university,
        embedding=embedding,
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return RequirementResponse.model_validate(req)


async def get_requirements(db: AsyncSession, user: User) -> list[RequirementResponse]:
    result = await db.scalars(
        select(CompanyRequirement)
        .where(CompanyRequirement.posted_by == user.id)
        .order_by(CompanyRequirement.created_at.desc())
    )
    return [RequirementResponse.model_validate(r) for r in result.all()]


async def match_candidates(
    db: AsyncSession,
    user: User,
    requirement_id: str,
    limit: int = 10,
) -> MatchResponse:
    req = await db.get(CompanyRequirement, requirement_id)
    if not req or req.posted_by != user.id:
        raise HTTPException(status_code=404, detail="Requirement not found")

    if req.embedding is None:
        req.embedding = await embed_requirement(
            req.role_title, req.description, json.loads(req.required_skills)
        )
        await db.commit()

    filters = "is_active = true"
    if req.preferred_university:
        filters += f" AND university = '{req.preferred_university}'"

    raw = await cosine_search(
        db, "users", req.embedding,
        limit=limit * 3,
        filters=filters,
    )
    if not raw:
        return MatchResponse(
            requirement=RequirementResponse.model_validate(req),
            candidates=[],
            total=0,
        )

    score_map = {r["id"]: r["score"] for r in raw}
    user_ids = [r["id"] for r in raw]

    users = (await db.scalars(select(User).where(User.id.in_(user_ids)))).all()
    users_by_id = {u.id: u for u in users}

    # Score and rank
    scored: list[tuple[User, float, float, float, float]] = []
    for uid in user_ids:
        student = users_by_id.get(uid)
        if not student or student.id == user.id:
            continue
        agg = await get_aggregate(db, student.id)
        vec   = score_map[uid]
        rep   = reputation_signal(agg.overall_avg, agg.total_reviews)
        act   = activity_signal(student.created_at, agg.total_reviews)
        final = compute_final_score(vec, rep, act)
        scored.append((student, vec, rep, act, final, agg))

    scored.sort(key=lambda x: x[4], reverse=True)
    top = scored[:limit]

    # Batch LLM summaries
    req_dict = {
        "company_name": req.company_name,
        "role_title": req.role_title,
        "required_skills": json.loads(req.required_skills),
    }
    batch_input = [
        {
            "name": f"{s.first_name} {s.last_name}",
            "skills": [sk.name for sk in (s.skills or [])],
            "final_score": final,
            "total_reviews": agg.total_reviews,
        }
        for s, _, _, _, final, agg in top
    ]
    summaries = await generate_candidate_summaries(req_dict, batch_input)

    # Notify matched students
    from src.services.notifications import create_notification
    from src.websockets.notifications import notification_manager
    from src.schemas.notification import NotificationResponse

    candidates = []
    for i, (student, vec, rep, act, final, agg) in enumerate(top):
        notif = await create_notification(
            db, student.id, "company_interest",
            f"{req.company_name} is interested in your profile for {req.role_title}",
        )
        await notification_manager.send_to(
            student.id,
            {"event": "notification", "data": NotificationResponse.model_validate(notif).model_dump(mode="json")},
        )
        candidates.append(CandidateResult(
            student=PublicUserResponse.model_validate(student),
            vector_score=vec,
            reputation_score=rep,
            activity_score=act,
            final_score=final,
            scores=agg,
            summary=summaries[i] if summaries else None,
        ))

    return MatchResponse(
        requirement=RequirementResponse.model_validate(req),
        candidates=candidates,
        total=len(candidates),
    )


async def toggle_requirement(
    db: AsyncSession, user: User, requirement_id: str
) -> RequirementResponse:
    req = await db.get(CompanyRequirement, requirement_id)
    if not req or req.posted_by != user.id:
        raise HTTPException(status_code=404, detail="Requirement not found")
    req.is_active = not req.is_active
    await db.commit()
    await db.refresh(req)
    return RequirementResponse.model_validate(req)
