from pydantic import BaseModel
from typing import Optional
from src.schemas.listing import ListingResponse
from src.schemas.user import PublicUserResponse
from src.schemas.review import AggregateScores


class ListingRecommendation(BaseModel):
    listing: ListingResponse
    vector_score: float         # cosine similarity
    reputation_score: float     # owner's overall_avg / 5.0
    activity_score: float       # recency + review count signal
    final_score: float          # weighted composite
    reason: Optional[str] = None


class StudentRecommendation(BaseModel):
    student: PublicUserResponse
    vector_score: float
    reputation_score: float
    activity_score: float
    final_score: float
    scores: AggregateScores


class HomeFeed(BaseModel):
    recommended_listings: list[ListingRecommendation]
    recommended_students: list[StudentRecommendation]
