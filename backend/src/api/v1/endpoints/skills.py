from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.schemas.skill import SkillsByCategory, SkillResponse
import src.services.skills as skills_service

router = APIRouter()


@router.get("/", response_model=list[SkillsByCategory])
async def get_skills(db: AsyncSession = Depends(get_db)):
    return await skills_service.get_all_grouped(db)


@router.get("/category/{category}", response_model=list[SkillResponse])
async def get_by_category(category: str, db: AsyncSession = Depends(get_db)):
    return await skills_service.get_by_category(db, category)


@router.post("/seed", include_in_schema=False)
async def seed_skills(db: AsyncSession = Depends(get_db)):
    return await skills_service.seed(db)
