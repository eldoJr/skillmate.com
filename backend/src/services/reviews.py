import math
import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.models.review import Review
from src.models.user import User
from src.schemas.review import ReviewCreate, ReviewResponse, AggregateScores, PaginatedReviews


async def submit_review(db: AsyncSession, reviewer: User, data: ReviewCreate) -> ReviewResponse:
    if reviewer.id == data.reviewee_id:
        raise HTTPException(status_code=400, detail="You cannot review yourself")

    reviewee = await db.get(User, data.reviewee_id)
    if not reviewee:
        raise HTTPException(status_code=404, detail="User not found")

    # Duplicate check
    if data.listing_id:
        existing = await db.scalar(
            select(Review).where(
                Review.reviewer_id == reviewer.id,
                Review.listing_id == data.listing_id,
            )
        )
        if existing:
            raise HTTPException(status_code=409, detail="You have already reviewed this listing")

    review = Review(
        id=str(uuid.uuid4()),
        reviewer_id=reviewer.id,
        reviewee_id=data.reviewee_id,
        listing_id=data.listing_id,
        reliability_score=data.reliability_score,
        professionalism_score=data.professionalism_score,
        growth_score=data.growth_score,
        comment=data.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    from src.services.notifications import create_notification
    from src.websockets.notifications import notification_manager
    from src.schemas.notification import NotificationResponse
    notif = await create_notification(
        db, data.reviewee_id, "new_review",
        f"{reviewer.first_name} left you a review",
    )
    await notification_manager.send_to(
        data.reviewee_id,
        {"event": "notification", "data": NotificationResponse.model_validate(notif).model_dump(mode="json")},
    )

    return ReviewResponse.model_validate(review)


async def get_reviews_for_user(
    db: AsyncSession, user_id: str, page: int, page_size: int
) -> PaginatedReviews:
    base = select(Review).where(Review.reviewee_id == user_id)
    total = await db.scalar(select(func.count()).select_from(base.subquery()))
    result = await db.scalars(
        base.order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = [ReviewResponse.model_validate(r) for r in result.all()]
    return PaginatedReviews(
        items=items,
        total=total,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
    )


async def get_aggregate(db: AsyncSession, user_id: str) -> AggregateScores:
    row = await db.execute(
        select(
            func.count(Review.id),
            func.avg(Review.reliability_score),
            func.avg(Review.professionalism_score),
            func.avg(Review.growth_score),
        ).where(Review.reviewee_id == user_id)
    )
    count, rel, pro, gro = row.one()
    if not count:
        return AggregateScores(total_reviews=0, avg_reliability=0, avg_professionalism=0, avg_growth=0, overall_avg=0)
    rel, pro, gro = round(rel, 2), round(pro, 2), round(gro, 2)
    return AggregateScores(
        total_reviews=count,
        avg_reliability=rel,
        avg_professionalism=pro,
        avg_growth=gro,
        overall_avg=round((rel + pro + gro) / 3, 2),
    )
