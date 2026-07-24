from fastapi import APIRouter, Query
from src.schemas.search import SearchResponse, MultiSearchResponse, SuggestResponse
import src.services.search as svc

router = APIRouter()


@router.get("/listings", response_model=SearchResponse)
async def search_listings(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = None,
    listing_type: str | None = None,
):
    return await svc.search_listings(q, limit=limit, category=category, listing_type=listing_type)


@router.get("/users", response_model=SearchResponse)
async def search_users(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    university: str | None = None,
):
    return await svc.search_users(q, limit=limit, university=university)


@router.get("/skills", response_model=SearchResponse)
async def search_skills(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
):
    return await svc.search_skills(q, limit=limit)


@router.get("/", response_model=MultiSearchResponse)
async def multi_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
):
    return await svc.multi_search(q, limit=limit)


@router.get("/suggest", response_model=SuggestResponse)
async def suggest(
    q: str = Query(..., min_length=1),
    limit: int = Query(8, ge=1, le=20),
):
    return await svc.suggest(q, limit=limit)
