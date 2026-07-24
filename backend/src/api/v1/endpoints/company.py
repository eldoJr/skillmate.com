from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.company import RequirementCreate, RequirementResponse, MatchResponse
import src.services.company as svc

router = APIRouter()


@router.post("/requirements", response_model=RequirementResponse, status_code=201)
async def post_requirement(
    data: RequirementCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.post_requirement(db, current_user, data)


@router.get("/requirements", response_model=list[RequirementResponse])
async def list_requirements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_requirements(db, current_user)


@router.get("/requirements/{requirement_id}/matches", response_model=MatchResponse)
async def match_candidates(
    requirement_id: str,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.match_candidates(db, current_user, requirement_id, limit=limit)


@router.post("/requirements/{requirement_id}/toggle", response_model=RequirementResponse)
async def toggle_requirement(
    requirement_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.toggle_requirement(db, current_user, requirement_id)
