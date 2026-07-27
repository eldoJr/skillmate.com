from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.core.deps import get_current_user, get_verified_user
from src.models.user import User
from src.schemas.user import (
    UserResponse,
    PublicUserResponse,
    UserUpdate,
    ProfileCompletionResponse,
    AvatarResponse,
    UserSkillsUpdate,
    ProfileStatsResponse,
)
import src.services.users as users_service
import src.services.activity as activity_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await users_service.update_me(db, current_user, payload)


@router.get("/me/completion", response_model=ProfileCompletionResponse)
async def get_completion(current_user: User = Depends(get_current_user)):
    return await users_service.get_profile_completion(current_user)


@router.post("/me/avatar", response_model=AvatarResponse, status_code=status.HTTP_200_OK)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await users_service.upload_avatar(db, current_user, file)
    return AvatarResponse(avatar_url=user.avatar_url)


@router.put("/me/skills", response_model=UserResponse)
async def set_skills(
    payload: UserSkillsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await users_service.update_skills(db, current_user, payload.skill_ids)


@router.post("/me/skills/{skill_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def attach_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await users_service.attach_skill(db, current_user, skill_id)


@router.delete("/me/skills/{skill_id}", response_model=UserResponse)
async def detach_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await users_service.detach_skill(db, current_user, skill_id)


@router.get("/me/stats", response_model=ProfileStatsResponse)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await activity_service.get_profile_stats(db, current_user.id)


@router.get("/{user_id}/stats", response_model=ProfileStatsResponse)
async def get_user_stats(user_id: str, db: AsyncSession = Depends(get_db)):
    return await activity_service.get_profile_stats(db, user_id)


@router.get("/{user_id}", response_model=PublicUserResponse)
async def get_public_profile(user_id: str, db: AsyncSession = Depends(get_db)):
    # Increment profile views
    await activity_service.increment_profile_views(db, user_id)
    return await users_service.get_public_profile(db, user_id)
