from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_verified_user, get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.review import ReviewCreate, ReviewResponse, AggregateScores, PaginatedReviews
import src.services.reviews as svc

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=201)
async def submit_review(
    data: ReviewCreate,
    current_user: User = Depends(get_verified_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.submit_review(db, current_user, data)


@router.get("/user/{user_id}", response_model=PaginatedReviews)
async def list_reviews(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_reviews_for_user(db, user_id, page, page_size)


@router.get("/user/{user_id}/aggregate", response_model=AggregateScores)
async def aggregate_scores(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_aggregate(db, user_id)
