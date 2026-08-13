import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from src.models.user import User
from src.schemas.auth import RegisterRequest, TokenResponse, MessageResponse, UserResponse
from src.core.security import (
    hash_password,
    hash_password_async,
    verify_password_async,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_secure_token,
    verification_token_expiry,
    reset_token_expiry,
)
logger = logging.getLogger(__name__)


def _dispatch(task_name: str, *args) -> None:
    """Lazy fire-and-forget — imports Celery task only when called."""
    try:
        from src.tasks.email import send_verification_email, send_password_reset_email  # noqa: PLC0415
        tasks = {
            "send_verification_email": send_verification_email,
            "send_password_reset_email": send_password_reset_email,
        }
        tasks[task_name].delay(*args)
    except Exception as exc:
        logger.warning("Could not enqueue task %s: %s", task_name, exc)


async def _get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def _get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def register(db: AsyncSession, payload: RegisterRequest) -> TokenResponse:
    if await _get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    token = generate_secure_token()

    user = User(
        email=payload.email,
        hashed_password=await hash_password_async(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        verification_token=token,
        verification_token_expires_at=verification_token_expiry(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    _dispatch("send_verification_email", user.email, user.first_name, token)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


async def login(db: AsyncSession, email: str, password: str) -> TokenResponse:
    user = await _get_user_by_email(db, email)

    if not user or not await verify_password_async(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


async def refresh(db: AsyncSession, refresh_token: str) -> TokenResponse:
    user_id = decode_token(refresh_token, token_type="refresh")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user = await _get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


async def verify_email(db: AsyncSession, token: str) -> MessageResponse:
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

    if user.is_verified:
        return MessageResponse(message="Email already verified")

    if user.verification_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token has expired")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    await db.commit()

    return MessageResponse(message="Email verified successfully")


async def resend_verification(db: AsyncSession, email: str) -> MessageResponse:
    user = await _get_user_by_email(db, email)

    # Always return success to prevent email enumeration
    if not user or user.is_verified:
        return MessageResponse(message="If that email exists and is unverified, a new link has been sent")

    token = generate_secure_token()
    user.verification_token = token
    user.verification_token_expires_at = verification_token_expiry()
    await db.commit()

    _dispatch("send_verification_email", user.email, user.first_name, token)

    return MessageResponse(message="If that email exists and is unverified, a new link has been sent")


async def forgot_password(db: AsyncSession, email: str) -> MessageResponse:
    user = await _get_user_by_email(db, email)

    # Always return success to prevent email enumeration
    if user and user.is_active:
        token = generate_secure_token()
        user.reset_token = token
        user.reset_token_expires_at = reset_token_expiry()
        await db.commit()
        _dispatch("send_password_reset_email", user.email, user.first_name, token)

    return MessageResponse(message="If that email is registered, a reset link has been sent")


async def reset_password(db: AsyncSession, token: str, new_password: str) -> MessageResponse:
    result = await db.execute(select(User).where(User.reset_token == token))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    if user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")

    user.hashed_password = await hash_password_async(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    await db.commit()

    return MessageResponse(message="Password reset successfully")
