import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    users: Mapped[list["User"]] = relationship(secondary="user_skills", back_populates="skills", lazy="selectin")
    listings: Mapped[list["Listing"]] = relationship(secondary="listing_skills", back_populates="skills", lazy="selectin")


SKILL_SEED: list[dict] = [
    # Technology
    {"name": "Python",             "category": "Technology"},
    {"name": "JavaScript",         "category": "Technology"},
    {"name": "TypeScript",         "category": "Technology"},
    {"name": "React",              "category": "Technology"},
    {"name": "Node.js",            "category": "Technology"},
    {"name": "FastAPI",            "category": "Technology"},
    {"name": "SQL",                "category": "Technology"},
    {"name": "Machine Learning",   "category": "Technology"},
    {"name": "Data Analysis",      "category": "Technology"},
    {"name": "DevOps",             "category": "Technology"},
    # Design
    {"name": "UI/UX Design",       "category": "Design"},
    {"name": "Figma",              "category": "Design"},
    {"name": "Graphic Design",     "category": "Design"},
    {"name": "Motion Graphics",    "category": "Design"},
    {"name": "3D Modeling",        "category": "Design"},
    # Writing
    {"name": "Copywriting",        "category": "Writing"},
    {"name": "Academic Writing",   "category": "Writing"},
    {"name": "Technical Writing",  "category": "Writing"},
    {"name": "Translation",        "category": "Writing"},
    {"name": "Proofreading",       "category": "Writing"},
    # Media
    {"name": "Video Editing",      "category": "Media"},
    {"name": "Photography",        "category": "Media"},
    {"name": "Podcast Production", "category": "Media"},
    {"name": "Social Media",       "category": "Media"},
    # Education
    {"name": "Tutoring",           "category": "Education"},
    {"name": "Mathematics",        "category": "Education"},
    {"name": "Physics",            "category": "Education"},
    {"name": "Language Teaching",  "category": "Education"},
    # Business
    {"name": "Digital Marketing",  "category": "Business"},
    {"name": "Business Analysis",  "category": "Business"},
    {"name": "Project Management", "category": "Business"},
    {"name": "Accounting",         "category": "Business"},
    # Music
    {"name": "Music Production",   "category": "Music"},
    {"name": "Mixing & Mastering", "category": "Music"},
    {"name": "Songwriting",        "category": "Music"},
]
