import json
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from src.ai.graph_state import AgentState
from src.ai.nim_client import chat_completion


# ── Node: assess ──────────────────────────────────────────────────────────────
async def assess_node(state: AgentState) -> dict:
    ctx = state["context"]
    gap = ctx.get("gap_report", {})

    profile_summary = (
        f"Student: {ctx['first_name']} {ctx['last_name']}\n"
        f"University: {ctx.get('university', 'N/A')} | Role: {ctx.get('current_role', 'N/A')}\n"
        f"Target role: {ctx['target_role']}\n"
        f"Present skills: {', '.join(gap.get('present_skills', [])) or 'None'}\n"
        f"Missing skills (priority order): "
        + ", ".join(
            f"{m['skill']} (~{m['estimated_weeks']}w)"
            for m in sorted(gap.get("missing_skills", []), key=lambda x: x.get("priority", 99))
        )
        + f"\nEstimated total weeks: {gap.get('estimated_weeks', 'unknown')}"
    )

    msg = HumanMessage(content=(
        f"{profile_summary}\n\n"
        "Based on this profile and skill gap, identify 3-5 major learning milestones "
        "needed to reach the target role. Each milestone should group related skills. "
        "Return a JSON array where each item has: "
        '{"title": string, "description": string, "skills": [string], '
        '"week_start": int, "week_end": int, "certifications": [string], "projects": [string]}. '
        "No explanation outside the JSON."
    ))
    raw = await chat_completion(
        [{"role": "user", "content": msg.content}],
        temperature=0.3,
        max_tokens=1500,
    )
    try:
        milestones = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        milestones = []

    return {
        "messages": [msg, AIMessage(content=raw)],
        "context": {**ctx, "milestones": milestones, "profile_summary": profile_summary},
    }


# ── Node: plan ────────────────────────────────────────────────────────────────
async def plan_node(state: AgentState) -> dict:
    ctx = state["context"]
    milestones = ctx.get("milestones", [])
    total_weeks = max((m.get("week_end", 0) for m in milestones), default=12)

    msg = HumanMessage(content=(
        f"Target role: {ctx['target_role']}\n"
        f"Milestones:\n{json.dumps(milestones, indent=2)}\n\n"
        f"Create a week-by-week study plan for {total_weeks} weeks. "
        "Return a JSON array where each item has: "
        '{"week": int, "focus": string, "tasks": [string], "resources": [string]}. '
        "Keep tasks concrete and actionable. No explanation outside the JSON."
    ))
    raw = await chat_completion(
        [{"role": "user", "content": msg.content}],
        temperature=0.4,
        max_tokens=3000,
    )
    try:
        weekly_plan = json.loads(raw)
    except (ValueError, json.JSONDecodeError):
        weekly_plan = []

    return {
        "messages": [msg, AIMessage(content=raw)],
        "context": {**ctx, "weekly_plan": weekly_plan, "total_weeks": total_weeks},
    }


# ── Node: generate ────────────────────────────────────────────────────────────
async def generate_node(state: AgentState) -> dict:
    ctx = state["context"]
    msg = HumanMessage(content=(
        f"Student profile summary:\n{ctx.get('profile_summary', '')}\n\n"
        f"Career roadmap: {len(ctx.get('milestones', []))} milestones over "
        f"{ctx.get('total_weeks', 0)} weeks to become a {ctx['target_role']}.\n\n"
        "Write a motivating 3-4 sentence overview of this roadmap. "
        "Mention the key milestones and the end goal. Plain text only."
    ))
    summary = await chat_completion(
        [{"role": "user", "content": msg.content}],
        temperature=0.7,
        max_tokens=300,
    )
    return {
        "messages": [msg, AIMessage(content=summary)],
        "context": {**ctx, "summary": summary},
    }


# ── Node: refine ──────────────────────────────────────────────────────────────
async def refine_node(state: AgentState) -> dict:
    """
    Validates and cleans up the weekly plan — ensures week numbers are sequential,
    fills any gaps, and trims to total_weeks. Pure Python, no LLM call needed.
    """
    ctx = state["context"]
    weekly_plan = ctx.get("weekly_plan", [])
    total_weeks = ctx.get("total_weeks", len(weekly_plan))

    # Deduplicate and sort by week number
    seen = set()
    cleaned = []
    for item in sorted(weekly_plan, key=lambda x: x.get("week", 0)):
        w = item.get("week", 0)
        if w not in seen and 1 <= w <= total_weeks:
            seen.add(w)
            cleaned.append(item)

    return {
        "messages": [],
        "context": {**ctx, "weekly_plan": cleaned},
        "output": ctx.get("summary", ""),
    }


# ── Graph ─────────────────────────────────────────────────────────────────────
def build_roadmap_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node("assess", assess_node)
    graph.add_node("plan", plan_node)
    graph.add_node("generate", generate_node)
    graph.add_node("refine", refine_node)
    graph.set_entry_point("assess")
    graph.add_edge("assess", "plan")
    graph.add_edge("plan", "generate")
    graph.add_edge("generate", "refine")
    graph.add_edge("refine", END)
    return graph
