from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user, require_ai
from src.db.session import get_db
from src.models.user import User
from src.schemas.roadmap import RoadmapRequest, RoadmapResponse, RoadmapVersionBrief
import src.services.roadmap as svc

router = APIRouter()


@router.post("/generate", response_model=RoadmapResponse, dependencies=[Depends(require_ai)])
async def generate(
    req: RoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.generate(db, current_user, req)


@router.get("/{target_role}/latest", response_model=RoadmapResponse)
async def get_latest(
    target_role: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_latest(db, current_user, target_role)


@router.get("/{target_role}/versions", response_model=list[RoadmapVersionBrief])
async def list_versions(
    target_role: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_versions(db, current_user, target_role)


@router.get("/{target_role}/versions/{version}", response_model=RoadmapResponse)
async def get_version(
    target_role: str,
    version: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_version(db, current_user, target_role, version)
