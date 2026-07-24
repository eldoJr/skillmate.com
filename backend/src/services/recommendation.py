from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User
from src.models.listing import Listing
from src.schemas.listing import ListingResponse
from src.schemas.user import PublicUserResponse
from src.schemas.review import AggregateScores
from src.schemas.recommendation import ListingRecommendation, StudentRecommendation, HomeFeed
from src.ai.vector_search import cosine_search
from src.ai.embeddings import embed_user
from src.ai.recommendation import compute_final_score, reputation_signal, activity_signal
from src.services.reviews import get_aggregate


async def _ensure_embedding(db: AsyncSession, user: User) -> list[float]:
    if user.embedding is None:
        user.embedding = await embed_user(user)
        await db.commit()
    return user.embedding


async def recommend_listings(
    db: AsyncSession,
    user: User,
    limit: int = 10,
) -> list[ListingRecommendation]:
    embedding = await _ensure_embedding(db, user)

    raw = await cosine_search(
        db, "listings", embedding,
        limit=limit * 3,   # over-fetch to allow re-ranking
        filters="is_active = true AND is_deleted = false",
    )
    if not raw:
        return []

    listing_ids = [r["id"] for r in raw]
    score_map = {r["id"]: r["score"] for r in raw}

    listings = (await db.scalars(select(Listing).where(Listing.id.in_(listing_ids)))).all()
    listings_by_id = {l.id: l for l in listings}

    results = []
    for lid in listing_ids:
        listing = listings_by_id.get(lid)
        if not listing or listing.owner_id == user.id:
            continue

        owner_agg = await get_aggregate(db, listing.owner_id)
        vec   = score_map[lid]
        rep   = reputation_signal(owner_agg.overall_avg, owner_agg.total_reviews)
        act   = activity_signal(listing.created_at, owner_agg.total_reviews)
        final = compute_final_score(vec, rep, act)

        results.append(ListingRecommendation(
            listing=ListingResponse.model_validate(listing),
            vector_score=vec,
            reputation_score=rep,
            activity_score=act,
            final_score=final,
        ))

    results.sort(key=lambda x: x.final_score, reverse=True)
    return results[:limit]


async def recommend_students(
    db: AsyncSession,
    listing: Listing,
    limit: int = 10,
) -> list[StudentRecommendation]:
    if listing.embedding is None:
        from src.ai.embeddings import embed_listing
        listing.embedding = await embed_listing(listing)
        await db.commit()

    raw = await cosine_search(
        db, "users", listing.embedding,
        limit=limit * 3,
        filters="is_active = true",
    )
    if not raw:
        return []

    user_ids = [r["id"] for r in raw]
    score_map = {r["id"]: r["score"] for r in raw}

    users = (await db.scalars(select(User).where(User.id.in_(user_ids)))).all()
    users_by_id = {u.id: u for u in users}

    results = []
    for uid in user_ids:
        student = users_by_id.get(uid)
        if not student or student.id == listing.owner_id:
            continue

        agg   = await get_aggregate(db, student.id)
        vec   = score_map[uid]
        rep   = reputation_signal(agg.overall_avg, agg.total_reviews)
        act   = activity_signal(student.created_at, agg.total_reviews)
        final = compute_final_score(vec, rep, act)

        results.append(StudentRecommendation(
            student=PublicUserResponse.model_validate(student),
            vector_score=vec,
            reputation_score=rep,
            activity_score=act,
            final_score=final,
            scores=agg,
        ))

    results.sort(key=lambda x: x.final_score, reverse=True)
    return results[:limit]


async def get_home_feed(
    db: AsyncSession,
    user: User,
    listing_limit: int = 6,
    student_limit: int = 6,
) -> HomeFeed:
    rec_listings = await recommend_listings(db, user, limit=listing_limit)

    # For student recs on the home feed, use the user's own most recent listing as the query
    rec_students: list[StudentRecommendation] = []
    if user.listings:
        latest_listing = max(user.listings, key=lambda l: l.created_at)
        if not latest_listing.is_deleted:
            rec_students = await recommend_students(db, latest_listing, limit=student_limit)

    return HomeFeed(
        recommended_listings=rec_listings,
        recommended_students=rec_students,
    )
