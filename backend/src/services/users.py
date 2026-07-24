import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User
from src.models.skill import Skill
from src.schemas.user import UserUpdate, ProfileCompletionResponse

AVATAR_DIR = Path("media/avatars")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


def _profile_completion(user: User) -> ProfileCompletionResponse:
    checks = {
        "headline": user.headline,
        "bio": user.bio,
        "university": user.university,
        "role": user.role,
        "avatar": user.avatar_url,
        "portfolio_url": user.portfolio_url,
        "skills": bool(user.skills),
    }
    completed = [k for k, v in checks.items() if v]
    missing = [k for k, v in checks.items() if not v]
    score = round((len(completed) / len(checks)) * 100)
    return ProfileCompletionResponse(score=score, missing=missing)


async def get_me(user: User) -> User:
    return user


async def get_profile_completion(user: User) -> ProfileCompletionResponse:
    return _profile_completion(user)


async def update_me(db: AsyncSession, user: User, payload: UserUpdate) -> User:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    from src.tasks.embeddings import generate_user_embedding
    generate_user_embedding.delay(user.id)
    from src.tasks.search_sync import sync_user_to_meili
    sync_user_to_meili.delay(user.id)
    return user


async def upload_avatar(db: AsyncSession, user: User, file: UploadFile) -> User:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, and WebP images are allowed")

    contents = await file.read()
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image must be under 5MB")

    AVATAR_DIR.mkdir(parents=True, exist_ok=True)

    # Remove old avatar file if it exists
    if user.avatar_url:
        old_path = Path(user.avatar_url.lstrip("/"))
        if old_path.exists():
            old_path.unlink()

    ext = file.content_type.split("/")[-1]
    filename = f"{user.id}_{uuid.uuid4().hex}.{ext}"
    file_path = AVATAR_DIR / filename

    with open(file_path, "wb") as f:
        f.write(contents)

    user.avatar_url = f"/media/avatars/{filename}"
    await db.commit()
    await db.refresh(user)
    return user


async def get_public_profile(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def update_skills(db: AsyncSession, user: User, skill_ids: list[str]) -> User:
    if not skill_ids:
        user.skills = []
        await db.commit()
        await db.refresh(user)
        return user

    result = await db.execute(select(Skill).where(Skill.id.in_(skill_ids)))
    skills = result.scalars().all()

    if len(skills) != len(skill_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more skill IDs are invalid")

    user.skills = list(skills)
    await db.commit()
    await db.refresh(user)
    from src.tasks.embeddings import generate_user_embedding
    generate_user_embedding.delay(user.id)
    from src.tasks.search_sync import sync_user_to_meili
    sync_user_to_meili.delay(user.id)
    return user


async def attach_skill(db: AsyncSession, user: User, skill_id: str) -> User:
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

    if skill not in user.skills:
        user.skills.append(skill)
        await db.commit()
        await db.refresh(user)

    return user


async def detach_skill(db: AsyncSession, user: User, skill_id: str) -> User:
    user.skills = [s for s in user.skills if s.id != skill_id]
    await db.commit()
    await db.refresh(user)
    return user
