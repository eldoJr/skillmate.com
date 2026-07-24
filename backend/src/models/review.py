import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reviewer_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    reviewee_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    listing_id: Mapped[str | None] = mapped_column(String, ForeignKey("listings.id"))
    reliability_score: Mapped[float] = mapped_column(Float, nullable=False)
    professionalism_score: Mapped[float] = mapped_column(Float, nullable=False)
    growth_score: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    reviewer: Mapped["User"] = relationship(foreign_keys=[reviewer_id], lazy="selectin")
    reviewee: Mapped["User"] = relationship(foreign_keys=[reviewee_id], back_populates="reviews_received", lazy="selectin")
    listing: Mapped["Listing"] = relationship(back_populates="reviews", lazy="selectin")
