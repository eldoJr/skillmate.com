import json
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.models.user import User
from src.models.roadmap import CareerRoadmap
from src.models.skill_gap import SkillGapReport
from src.schemas.roadmap import RoadmapRequest, RoadmapResponse, RoadmapVersionBrief
from src.ai.roadmap import build_roadmap_graph
from src.ai.graph_runner import run_graph
from src.ai.graph_state import AgentState


async def _get_gap_context(db: AsyncSession, user_id: str, target_role: str) -> dict:
    """RAG: pull the stored skill gap report as context for the roadmap graph."""
    report = await db.scalar(
        select(SkillGapReport).where(
            SkillGapReport.user_id == user_id,
            SkillGapReport.target_role == target_role,
        )
    )
    if not report:
        return {}
    return {
        "present_skills": json.loads(report.present_skills),
        "missing_skills": json.loads(report.missing_skills),
        "estimated_weeks": report.estimated_weeks,
        "gap_summary": report.summary,
    }


async def generate(db: AsyncSession, user: User, req: RoadmapRequest) -> RoadmapResponse:
    gap_report = await _get_gap_context(db, user.id, req.target_role)
    if not gap_report:
        raise HTTPException(
            status_code=400,
            detail="Run a skill gap analysis for this role first before generating a roadmap.",
        )

    context = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "university": user.university,
        "current_role": user.role,
        "target_role": req.target_role,
        "gap_report": gap_report,
    }

    initial_state: AgentState = {
        "messages": [],
        "user_id": user.id,
        "context": context,
        "output": None,
    }

    final_state = await run_graph(build_roadmap_graph(), initial_state)
    ctx = final_state["context"]

    # Version bump — each generation creates a new versioned record
    latest_version = await db.scalar(
        select(func.max(CareerRoadmap.version)).where(
            CareerRoadmap.user_id == user.id,
            CareerRoadmap.target_role == req.target_role,
        )
    ) or 0

    roadmap = CareerRoadmap(
        user_id=user.id,
        target_role=req.target_role,
        version=latest_version + 1,
        milestones=json.dumps(ctx.get("milestones", [])),
        weekly_plan=json.dumps(ctx.get("weekly_plan", [])),
        summary=ctx.get("summary", ""),
        total_weeks=ctx.get("total_weeks", 0),
    )
    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)
    return RoadmapResponse.model_validate(roadmap)


async def get_latest(db: AsyncSession, user: User, target_role: str) -> RoadmapResponse:
    roadmap = await db.scalar(
        select(CareerRoadmap)
        .where(CareerRoadmap.user_id == user.id, CareerRoadmap.target_role == target_role)
        .order_by(CareerRoadmap.version.desc())
        .limit(1)
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found for this role.")
    return RoadmapResponse.model_validate(roadmap)


async def list_versions(db: AsyncSession, user: User, target_role: str) -> list[RoadmapVersionBrief]:
    result = await db.scalars(
        select(CareerRoadmap)
        .where(CareerRoadmap.user_id == user.id, CareerRoadmap.target_role == target_role)
        .order_by(CareerRoadmap.version.desc())
    )
    return [RoadmapVersionBrief.model_validate(r) for r in result.all()]


async def get_version(db: AsyncSession, user: User, target_role: str, version: int) -> RoadmapResponse:
    roadmap = await db.scalar(
        select(CareerRoadmap).where(
            CareerRoadmap.user_id == user.id,
            CareerRoadmap.target_role == target_role,
            CareerRoadmap.version == version,
        )
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap version not found.")
    return RoadmapResponse.model_validate(roadmap)
