from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user, require_ai
from src.db.session import get_db
from src.models.user import User
from src.schemas.recommendation import ListingRecommendation, StudentRecommendation, HomeFeed
import src.services.recommendation as svc
import src.services.listings as listing_svc

router = APIRouter()


@router.get("/listings", response_model=list[ListingRecommendation], dependencies=[Depends(require_ai)])
async def recommend_listings(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.recommend_listings(db, current_user, limit=limit)


@router.get("/students/{listing_id}", response_model=list[StudentRecommendation], dependencies=[Depends(require_ai)])
async def recommend_students(
    listing_id: str,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = await listing_svc.get_listing(db, listing_id)
    return await svc.recommend_students(db, listing, limit=limit)


@router.get("/feed", response_model=HomeFeed, dependencies=[Depends(require_ai)])
async def home_feed(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_home_feed(db, current_user)
