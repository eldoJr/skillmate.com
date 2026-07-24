import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class SkillGapReport(Base):
    __tablename__ = "skill_gap_reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role: Mapped[str] = mapped_column(String(200), nullable=False)
    # JSON-encoded fields
    missing_skills: Mapped[str] = mapped_column(Text, nullable=False)   # list[{skill, priority, reason}]
    present_skills: Mapped[str] = mapped_column(Text, nullable=False)   # list[str]
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_weeks: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(lazy="selectin")
