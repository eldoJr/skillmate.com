import json
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.user import User
from src.models.skill_gap import SkillGapReport
from src.schemas.skill_gap import SkillGapRequest, SkillGapReportResponse
from src.ai.skill_gap import build_skill_gap_graph
from src.ai.graph_runner import run_graph
from src.ai.graph_state import AgentState


async def analyze(db: AsyncSession, user: User, req: SkillGapRequest) -> SkillGapReportResponse:
    context = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "university": user.university,
        "role": user.role,
        "headline": user.headline,
        "bio": user.bio,
        "skills": [s.name for s in (user.skills or [])],
        "target_role": req.target_role,
    }

    initial_state: AgentState = {
        "messages": [],
        "user_id": user.id,
        "context": context,
        "output": None,
    }

    final_state = await run_graph(build_skill_gap_graph(), initial_state)
    ctx = final_state["context"]

    missing = ctx.get("missing_skills", [])
    present = ctx.get("present_skills", [])
    summary = ctx.get("summary", "")
    estimated_weeks = ctx.get("estimated_weeks")

    # Upsert — one report per user per target role
    existing = await db.scalar(
        select(SkillGapReport).where(
            SkillGapReport.user_id == user.id,
            SkillGapReport.target_role == req.target_role,
        )
    )

    if existing:
        existing.missing_skills = json.dumps(missing)
        existing.present_skills = json.dumps(present)
        existing.summary = summary
        existing.estimated_weeks = estimated_weeks
        report = existing
    else:
        report = SkillGapReport(
            user_id=user.id,
            target_role=req.target_role,
            missing_skills=json.dumps(missing),
            present_skills=json.dumps(present),
            summary=summary,
            estimated_weeks=estimated_weeks,
        )
        db.add(report)

    await db.commit()
    await db.refresh(report)
    return SkillGapReportResponse.model_validate(report)


async def get_report(db: AsyncSession, user: User, target_role: str) -> SkillGapReportResponse:
    report = await db.scalar(
        select(SkillGapReport).where(
            SkillGapReport.user_id == user.id,
            SkillGapReport.target_role == target_role,
        )
    )
    if not report:
        raise HTTPException(status_code=404, detail="No gap report found for this role. Run an analysis first.")
    return SkillGapReportResponse.model_validate(report)


async def list_reports(db: AsyncSession, user: User) -> list[SkillGapReportResponse]:
    result = await db.scalars(
        select(SkillGapReport)
        .where(SkillGapReport.user_id == user.id)
        .order_by(SkillGapReport.updated_at.desc())
    )
    return [SkillGapReportResponse.model_validate(r) for r in result.all()]
