import json
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from src.ai.graph_state import AgentState
from src.ai.nim_client import chat_completion, get_nim_client
from src.core.config import settings


def _build_system_prompt(ctx: dict) -> str:
    gap_section = ""
    if ctx.get("gap_reports"):
        lines = []
        for r in ctx["gap_reports"]:
            missing = ", ".join(m["skill"] for m in r.get("missing_skills", [])[:5])
            lines.append(f"  - {r['target_role']}: missing {missing or 'nothing critical'}")
        gap_section = "Skill gap reports:\n" + "\n".join(lines)

    roadmap_section = ""
    if ctx.get("roadmaps"):
        lines = [f"  - {r['target_role']}: {r['total_weeks']} week roadmap (v{r['version']})" for r in ctx["roadmaps"]]
        roadmap_section = "Active roadmaps:\n" + "\n".join(lines)

    reviews_section = ""
    if ctx.get("aggregate_scores"):
        s = ctx["aggregate_scores"]
        reviews_section = (
            f"Reputation scores: reliability={s.get('avg_reliability', 0)}, "
            f"professionalism={s.get('avg_professionalism', 0)}, "
            f"growth={s.get('avg_growth', 0)} ({s.get('total_reviews', 0)} reviews)"
        )

    return f"""You are the Skillmate AI Career Mentor — a knowledgeable, encouraging, and honest career advisor for university students.

Student profile:
  Name: {ctx.get('first_name')} {ctx.get('last_name')}
  University: {ctx.get('university', 'N/A')}
  Current role/focus: {ctx.get('role', 'N/A')}
  Headline: {ctx.get('headline', 'N/A')}
  Skills: {', '.join(ctx.get('skills', [])) or 'None listed'}

{gap_section}
{roadmap_section}
{reviews_section}

Guidelines:
- Give specific, actionable advice grounded in the student's actual profile above
- Be concise — 2-4 paragraphs max unless a detailed breakdown is explicitly requested
- Never make up certifications, courses, or companies — only suggest real, well-known ones
- If you don't know something, say so honestly
- Refer to the student by first name occasionally to keep it personal"""


# ── Node: respond ─────────────────────────────────────────────────────────────
async def respond_node(state: AgentState) -> dict:
    ctx = state["context"]
    system_prompt = _build_system_prompt(ctx)

    # Reconstruct message history for NIM
    nim_messages = [{"role": "system", "content": system_prompt}]
    for msg in state["messages"]:
        if isinstance(msg, HumanMessage):
            nim_messages.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            nim_messages.append({"role": "assistant", "content": msg.content})

    reply = await chat_completion(nim_messages, temperature=0.7, max_tokens=1024)
    return {
        "messages": [AIMessage(content=reply)],
        "output": reply,
    }


# ── Graph ─────────────────────────────────────────────────────────────────────
def build_mentor_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("respond", respond_node)
    graph.set_entry_point("respond")
    graph.add_edge("respond", END)
    return graph


# ── Streaming variant ─────────────────────────────────────────────────────────
async def stream_mentor_response(state: AgentState):
    """Stream tokens directly from NIM — bypasses LangGraph for true token streaming."""
    import json
    ctx = state["context"]
    system_prompt = _build_system_prompt(ctx)

    nim_messages = [{"role": "system", "content": system_prompt}]
    for msg in state["messages"]:
        if isinstance(msg, HumanMessage):
            nim_messages.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            nim_messages.append({"role": "assistant", "content": msg.content})

    client = get_nim_client()
    stream = await client.chat.completions.create(
        model=settings.NIM_LLM_MODEL,
        messages=nim_messages,
        temperature=0.7,
        max_tokens=1024,
        stream=True,
    )

    full_reply = []
    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        if delta:
            full_reply.append(delta)
            yield f"data: {json.dumps({'content': delta})}\n\n"

    yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
    # Return full reply via a sentinel so the caller can persist it
    state["output"] = "".join(full_reply)
