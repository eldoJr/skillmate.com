import json
from typing import Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from src.ai.graph_state import AgentState
from src.ai.nim_client import chat_completion


# ── Node: assess ─────────────────────────────────────────────────────────────
async def assess_node(state: AgentState) -> dict:
    ctx: dict[str, Any] = state["context"]
    profile_text = (
        f"Name: {ctx['first_name']} {ctx['last_name']}\n"
        f"University: {ctx.get('university', 'N/A')}\n"
        f"Role: {ctx.get('role', 'N/A')}\n"
        f"Headline: {ctx.get('headline', 'N/A')}\n"
        f"Bio: {ctx.get('bio', 'N/A')}\n"
        f"Current skills: {', '.join(ctx.get('skills', [])) or 'None listed'}"
    )
    msg = HumanMessage(content=(
        f"Here is a student's profile:\n{profile_text}\n\n"
        f"Their target role is: {ctx['target_role']}\n\n"
        "List the skills they already have that are relevant to this role. "
        "Reply with a JSON array of skill name strings only. No explanation."
    ))
    raw = await chat_completion(
        [{"role": "user", "content": msg.content}],
        temperature=0.2,
        max_tokens=512,
    )
    try:
        present = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        present = []

    return {
        "messages": [msg, AIMessage(content=raw)],
        "context": {**ctx, "present_skills": present},
    }


# ── Node: analyze ─────────────────────────────────────────────────────────────
async def analyze_node(state: AgentState) -> dict:
    ctx = state["context"]
    present = ctx.get("present_skills", [])
    msg = HumanMessage(content=(
        f"Target role: {ctx['target_role']}\n"
        f"Skills the student already has: {', '.join(present) or 'None'}\n\n"
        "Identify the top missing skills needed for this role. "
        "Return a JSON array where each item has: "
        '{"skill": string, "priority": int (1=highest), "reason": string, "estimated_weeks": int}. '
        "Return at most 8 items. No explanation outside the JSON."
    ))
    raw = await chat_completion(
        [{"role": "user", "content": msg.content}],
        temperature=0.3,
        max_tokens=1024,
    )
    try:
        missing = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        missing = []

    total_weeks = sum(item.get("estimated_weeks", 0) for item in missing) if missing else None

    return {
        "messages": [msg, AIMessage(content=raw)],
        "context": {**ctx, "missing_skills": missing, "estimated_weeks": total_weeks},
    }


# ── Node: generate ────────────────────────────────────────────────────────────
async def generate_node(state: AgentState) -> dict:
    ctx = state["context"]
    missing_names = [m["skill"] for m in ctx.get("missing_skills", [])]
    msg = HumanMessage(content=(
        f"Student target role: {ctx['target_role']}\n"
        f"Present skills: {', '.join(ctx.get('present_skills', [])) or 'None'}\n"
        f"Missing skills (priority order): {', '.join(missing_names) or 'None'}\n\n"
        "Write a concise 2-3 sentence summary of this student's skill gap. "
        "Be encouraging but honest. Plain text only."
    ))
    summary = await chat_completion(
        [{"role": "user", "content": msg.content}],
        temperature=0.6,
        max_tokens=256,
    )
    return {
        "messages": [msg, AIMessage(content=summary)],
        "context": {**ctx, "summary": summary},
        "output": summary,
    }


# ── Graph ─────────────────────────────────────────────────────────────────────
def build_skill_gap_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("assess", assess_node)
    graph.add_node("analyze", analyze_node)
    graph.add_node("generate", generate_node)
    graph.set_entry_point("assess")
    graph.add_edge("assess", "analyze")
    graph.add_edge("analyze", "generate")
    graph.add_edge("generate", END)
    return graph
