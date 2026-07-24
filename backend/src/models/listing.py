import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Boolean, DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


listing_skills = Table(
    "listing_skills",
    Base.metadata,
    Column("listing_id", String, ForeignKey("listings.id"), primary_key=True),
    Column("skill_id", String, ForeignKey("skills.id"), primary_key=True),
)


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float | None] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner: Mapped["User"] = relationship(back_populates="listings", lazy="selectin")
    skills: Mapped[list["Skill"]] = relationship(secondary=listing_skills, back_populates="listings", lazy="selectin")
    reviews: Mapped[list["Review"]] = relationship(back_populates="listing", lazy="selectin")
