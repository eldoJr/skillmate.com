from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.skill_gap import SkillGapRequest, SkillGapReportResponse
import src.services.skill_gap as svc

router = APIRouter()


@router.post("/analyze", response_model=SkillGapReportResponse)
async def analyze(
    req: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.analyze(db, current_user, req)


@router.get("/", response_model=list[SkillGapReportResponse])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_reports(db, current_user)


@router.get("/{target_role}", response_model=SkillGapReportResponse)
async def get_report(
    target_role: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_report(db, current_user, target_role)
