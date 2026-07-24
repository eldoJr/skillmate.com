from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.models.skill import Skill, SKILL_SEED
from src.schemas.skill import SkillsByCategory, SkillResponse


async def get_all_grouped(db: AsyncSession) -> list[SkillsByCategory]:
    result = await db.execute(select(Skill).order_by(Skill.category, Skill.name))
    skills = result.scalars().all()

    grouped: dict[str, list[SkillResponse]] = defaultdict(list)
    for skill in skills:
        grouped[skill.category].append(SkillResponse.model_validate(skill))

    return [SkillsByCategory(category=cat, skills=items) for cat, items in sorted(grouped.items())]


async def get_by_category(db: AsyncSession, category: str) -> list[SkillResponse]:
    result = await db.execute(
        select(Skill).where(func.lower(Skill.category) == category.lower()).order_by(Skill.name)
    )
    return result.scalars().all()


async def seed(db: AsyncSession) -> dict:
    result = await db.execute(select(func.count()).select_from(Skill))
    count = result.scalar()

    if count > 0:
        return {"message": f"Skills already seeded ({count} records)"}

    skills = [Skill(name=s["name"], category=s["category"]) for s in SKILL_SEED]
    db.add_all(skills)
    await db.commit()

    return {"message": f"{len(skills)} skills seeded successfully"}
