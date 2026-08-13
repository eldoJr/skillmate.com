from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.schemas.skill import SkillsByCategory, SkillResponse, SkillCreate
import src.services.skills as skills_service

router = APIRouter()


@router.get("/", response_model=list[SkillsByCategory])
async def get_skills(db: AsyncSession = Depends(get_db)):
    return await skills_service.get_all_grouped(db)


@router.get("/category/{category}", response_model=list[SkillResponse])
async def get_by_category(category: str, db: AsyncSession = Depends(get_db)):
    return await skills_service.get_by_category(db, category)


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    payload: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a custom skill. Returns existing skill if name already exists."""
    return await skills_service.create_skill(db, payload)


@router.post("/seed", include_in_schema=False)
async def seed_skills(db: AsyncSession = Depends(get_db)):
    return await skills_service.seed(db)
