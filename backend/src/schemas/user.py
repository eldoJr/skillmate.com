from pydantic import BaseModel, EmailStr
from datetime import date, datetime


class SkillBrief(BaseModel):
    id: str
    name: str
    category: str

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    university: str | None
    role: str | None
    headline: str | None
    bio: str | None
    avatar_url: str | None
    portfolio_url: str | None
    github_username: str | None
    location: str | None
    profile_views: int
    is_verified: bool
    skills: list[SkillBrief]
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicUserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    university: str | None
    role: str | None
    headline: str | None
    bio: str | None
    avatar_url: str | None
    portfolio_url: str | None
    github_username: str | None
    location: str | None
    profile_views: int
    is_verified: bool
    skills: list[SkillBrief]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    university: str | None = None
    role: str | None = None
    headline: str | None = None
    bio: str | None = None
    portfolio_url: str | None = None
    github_username: str | None = None
    location: str | None = None


class ProfileCompletionResponse(BaseModel):
    score: int
    missing: list[str]


class AvatarResponse(BaseModel):
    avatar_url: str


class UserSkillsUpdate(BaseModel):
    skill_ids: list[str]


class ActivityDay(BaseModel):
    date: date
    count: int

    model_config = {"from_attributes": True}


class ProfileStatsResponse(BaseModel):
    profile_views: int
    total_reviews: int
    total_listings: int
    total_portfolio: int
    active_days: int
    max_streak: int
    reputation_score: float
    activity_heatmap: list[ActivityDay]

