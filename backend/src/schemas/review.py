from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


def _validate_score(v: float) -> float:
    if not (1.0 <= v <= 5.0):
        raise ValueError("Score must be between 1 and 5")
    return round(v * 2) / 2  # round to nearest 0.5


class ReviewCreate(BaseModel):
    reviewee_id: str
    listing_id: Optional[str] = None
    reliability_score: float
    professionalism_score: float
    growth_score: float
    comment: Optional[str] = None

    @field_validator("reliability_score", "professionalism_score", "growth_score")
    @classmethod
    def validate_score(cls, v: float) -> float:
        return _validate_score(v)


class ReviewerBrief(BaseModel):
    id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ReviewResponse(BaseModel):
    id: str
    reviewer: ReviewerBrief
    reviewee_id: str
    listing_id: Optional[str] = None
    reliability_score: float
    professionalism_score: float
    growth_score: float
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AggregateScores(BaseModel):
    total_reviews: int
    avg_reliability: float
    avg_professionalism: float
    avg_growth: float
    overall_avg: float


class PaginatedReviews(BaseModel):
    items: list[ReviewResponse]
    total: int
    page: int
    pages: int
