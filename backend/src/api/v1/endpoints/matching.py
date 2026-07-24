from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.matching import PaginatedMatches
import src.services.matching as svc

router = APIRouter()


@router.get("/", response_model=PaginatedMatches)
async def get_matches(
    limit: int = Query(10, ge=1, le=50),
    explain: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_matches(db, current_user, limit=limit, explain=explain)


@router.post("/refresh", status_code=200)
async def refresh_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.refresh_user_matches(db, current_user)
