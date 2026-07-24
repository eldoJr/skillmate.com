import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Boolean, DateTime, ForeignKey, Table, Column, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from src.db.base import Base
from src.core.config import settings
import enum


class ListingType(str, enum.Enum):
    service = "service"   # student offers a service
    request = "request"   # student requests a service


listing_skills = Table(
    "listing_skills",
    Base.metadata,
    Column("listing_id", String, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id",   String, ForeignKey("skills.id",   ondelete="CASCADE"), primary_key=True),
)


class Listing(Base):
    __tablename__ = "listings"

    id:           Mapped[str]        = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id:     Mapped[str]        = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title:        Mapped[str]        = mapped_column(String(200), nullable=False)
    description:  Mapped[str]        = mapped_column(Text, nullable=False)
    category:     Mapped[str]        = mapped_column(String(100), nullable=False, index=True)
    listing_type: Mapped[str]        = mapped_column(String(20), nullable=False, default=ListingType.service)
    price:        Mapped[float|None] = mapped_column(Float)
    price_min:    Mapped[float|None] = mapped_column(Float)
    price_max:    Mapped[float|None] = mapped_column(Float)
    delivery_days:Mapped[int|None]   = mapped_column(Integer)
    cover_image:  Mapped[str|None]   = mapped_column(String)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(settings.NIM_EMBEDDING_DIMENSION), nullable=True)
    is_active:    Mapped[bool]       = mapped_column(Boolean, default=True, index=True)
    is_deleted:   Mapped[bool]       = mapped_column(Boolean, default=False)
    created_at:   Mapped[datetime]   = mapped_column(DateTime, default=datetime.utcnow)
    updated_at:   Mapped[datetime]   = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner:   Mapped["User"]          = relationship(back_populates="listings", lazy="selectin")
    skills:  Mapped[list["Skill"]]   = relationship(secondary=listing_skills, back_populates="listings", lazy="selectin")
    reviews: Mapped[list["Review"]]  = relationship(back_populates="listing", lazy="selectin")
