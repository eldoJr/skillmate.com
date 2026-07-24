from pydantic import BaseModel, EmailStr
from datetime import datetime


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
    is_verified: bool
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
