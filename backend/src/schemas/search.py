from pydantic import BaseModel
from typing import Optional, Any


class SearchHit(BaseModel):
    id: str
    type: str           # "listing" | "user" | "skill"
    title: str          # listing title / user full name / skill name
    subtitle: Optional[str] = None   # category / university / skill category
    score: Optional[float] = None
    data: dict[str, Any] = {}        # raw Meilisearch document


class SearchResponse(BaseModel):
    query: str
    hits: list[SearchHit]
    total: int
    index: str


class MultiSearchResponse(BaseModel):
    query: str
    listings: SearchResponse
    users: SearchResponse
    skills: SearchResponse
    total: int


class SuggestResponse(BaseModel):
    query: str
    suggestions: list[str]
