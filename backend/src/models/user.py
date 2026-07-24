import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    university: Mapped[str | None] = mapped_column(String(200))
    role: Mapped[str | None] = mapped_column(String(50))
    headline: Mapped[str | None] = mapped_column(String(200))
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(String)
    portfolio_url: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Email verification
    verification_token: Mapped[str | None] = mapped_column(String, index=True)
    verification_token_expires_at: Mapped[datetime | None] = mapped_column(DateTime)

    # Password reset
    reset_token: Mapped[str | None] = mapped_column(String, index=True)
    reset_token_expires_at: Mapped[datetime | None] = mapped_column(DateTime)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listings: Mapped[list["Listing"]] = relationship(back_populates="owner", lazy="selectin")
    reviews_received: Mapped[list["Review"]] = relationship(foreign_keys="Review.reviewee_id", back_populates="reviewee", lazy="selectin")
    messages_sent: Mapped[list["Message"]] = relationship(foreign_keys="Message.sender_id", back_populates="sender", lazy="selectin")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", lazy="selectin")
