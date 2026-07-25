from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("email")
    @classmethod
    def university_email(cls, v: str) -> str:
        UNIVERSITY_DOMAINS = [
            ".edu", ".ac.uk", ".ac.za", ".ac.in", ".ac.nz", ".ac.jp",
            ".edu.au", ".edu.br", ".edu.sg", ".edu.my", ".edu.ph",
            ".edu.pk", ".edu.ng", ".edu.gh", ".edu.ke", ".edu.mx",
            ".edu.co", ".edu.ar", ".edu.pe", ".edu.vn", ".edu.cn",
            ".edu.hk", ".edu.tw", ".edu.tr", ".edu.eg", ".edu.sa",
        ]
        if not any(v.endswith(ext) for ext in UNIVERSITY_DOMAINS):
            raise ValueError("Must use a university email address")
        return v.lower()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    university: str | None
    role: str | None
    headline: str | None
    bio: str | None
    avatar_url: str | None
    portfolio_url: str | None
    is_verified: bool
    skills: list
    created_at: datetime

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class MessageResponse(BaseModel):
    message: str
