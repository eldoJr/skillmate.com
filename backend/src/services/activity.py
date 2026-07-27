import uuid
from datetime import date, timedelta, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from src.models.activity import UserActivity
from src.models.user import User
from src.models.review import Review
from src.models.listing import Listing
from src.models.portfolio import Portfolio
from src.schemas.user import ActivityDay, ProfileStatsResponse


async def record_activity(db: AsyncSession, user_id: str) -> None:
    """Record one activity unit for today (called when user completes an action)."""
    today = date.today()
    result = await db.execute(
        select(UserActivity).where(
            UserActivity.user_id == user_id,
            UserActivity.activity_date == today,
        )
    )
    entry = result.scalar_one_or_none()
    if entry:
        entry.count += 1
    else:
        entry = UserActivity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            activity_date=today,
            count=1,
        )
        db.add(entry)
    await db.commit()


async def increment_profile_views(db: AsyncSession, user_id: str) -> None:
    """Increment the profile view counter."""
    await db.execute(
        update(User).where(User.id == user_id).values(profile_views=User.profile_views + 1)
    )
    await db.commit()


async def get_activity_heatmap(db: AsyncSession, user_id: str, days: int = 365) -> list[ActivityDay]:
    """Get activity data for the past N days."""
    start_date = date.today() - timedelta(days=days)
    result = await db.execute(
        select(UserActivity)
        .where(
            UserActivity.user_id == user_id,
            UserActivity.activity_date >= start_date,
        )
        .order_by(UserActivity.activity_date)
    )
    entries = result.scalars().all()
    return [ActivityDay(date=e.activity_date, count=e.count) for e in entries]


def _compute_streak(activities: list[ActivityDay]) -> tuple[int, int]:
    """Compute active days and max streak from activity data."""
    if not activities:
        return 0, 0

    active_days = len(activities)
    dates_set = {a.date for a in activities}
    sorted_dates = sorted(dates_set)

    max_streak = 1
    current_streak = 1
    for i in range(1, len(sorted_dates)):
        if sorted_dates[i] - sorted_dates[i - 1] == timedelta(days=1):
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 1

    return active_days, max_streak


async def get_profile_stats(db: AsyncSession, user_id: str) -> ProfileStatsResponse:
    """Get comprehensive profile statistics for a user."""
    # Profile views
    user_result = await db.execute(select(User.profile_views).where(User.id == user_id))
    profile_views = user_result.scalar_one_or_none() or 0

    # Total reviews received
    review_count = await db.scalar(
        select(func.count(Review.id)).where(Review.reviewee_id == user_id)
    ) or 0

    # Total listings
    listing_count = await db.scalar(
        select(func.count(Listing.id)).where(Listing.owner_id == user_id)
    ) or 0

    # Total portfolio entries
    portfolio_count = await db.scalar(
        select(func.count(Portfolio.id)).where(Portfolio.user_id == user_id)
    ) or 0

    # Average reputation
    avg_scores = await db.execute(
        select(
            func.avg(Review.reliability_score),
            func.avg(Review.professionalism_score),
            func.avg(Review.growth_score),
        ).where(Review.reviewee_id == user_id)
    )
    row = avg_scores.one_or_none()
    if row and row[0] is not None:
        reputation_score = round((float(row[0]) + float(row[1]) + float(row[2])) / 3, 1)
    else:
        reputation_score = 0.0

    # Activity heatmap
    heatmap = await get_activity_heatmap(db, user_id)
    active_days, max_streak = _compute_streak(heatmap)

    return ProfileStatsResponse(
        profile_views=profile_views,
        total_reviews=review_count,
        total_listings=listing_count,
        total_portfolio=portfolio_count,
        active_days=active_days,
        max_streak=max_streak,
        reputation_score=reputation_score,
        activity_heatmap=heatmap,
    )
