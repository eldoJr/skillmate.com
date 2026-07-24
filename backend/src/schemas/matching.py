from pydantic import BaseModel
from typing import Optional
from src.schemas.listing import ListingResponse


class MatchResult(BaseModel):
    listing: ListingResponse
    score: float                    # cosine similarity 0-1
    explanation: Optional[str] = None


class PaginatedMatches(BaseModel):
    items: list[MatchResult]
    total: int
