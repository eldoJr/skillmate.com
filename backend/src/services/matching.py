from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User
from src.models.listing import Listing
from src.schemas.listing import ListingResponse
from src.schemas.matching import MatchResult, PaginatedMatches
from src.ai.vector_search import cosine_search
from src.ai.embeddings import embed_user
from src.ai.matching import explain_matches_batch


async def get_matches(
    db: AsyncSession,
    user: User,
    limit: int = 10,
    explain: bool = True,
) -> PaginatedMatches:
    # Ensure user has an embedding — generate on-the-fly if missing
    if user.embedding is None:
        user.embedding = await embed_user(user)
        await db.commit()

    raw_matches = await cosine_search(
        db,
        table="listings",
        embedding=user.embedding,
        limit=limit,
        filters="is_active = true AND is_deleted = false",
    )

    if not raw_matches:
        return PaginatedMatches(items=[], total=0)

    # Hydrate listing objects
    listing_ids = [m["id"] for m in raw_matches]
    score_map = {m["id"]: m["score"] for m in raw_matches}

    result = await db.scalars(select(Listing).where(Listing.id.in_(listing_ids)))
    listings_by_id = {l.id: l for l in result.all()}

    # Preserve cosine-ranked order
    ordered_listings = [listings_by_id[lid] for lid in listing_ids if lid in listings_by_id]

    # Exclude own listings
    ordered_listings = [l for l in ordered_listings if l.owner_id != user.id]

    explanations: list[str] = []
    if explain and ordered_listings:
        student_profile = {
            "skills": [s.name for s in (user.skills or [])],
            "headline": user.headline,
            "role": user.role,
        }
        batch_input = [
            {
                "title": l.title,
                "skills": [s.name for s in (l.skills or [])],
                "score": score_map[l.id],
            }
            for l in ordered_listings
        ]
        explanations = await explain_matches_batch(student_profile, batch_input)

    items = [
        MatchResult(
            listing=ListingResponse.model_validate(listing),
            score=score_map[listing.id],
            explanation=explanations[i] if explanations else None,
        )
        for i, listing in enumerate(ordered_listings)
    ]

    return PaginatedMatches(items=items, total=len(items))


async def refresh_user_matches(db: AsyncSession, user: User) -> dict:
    """Force re-embed the user profile and return fresh matches."""
    user.embedding = await embed_user(user)
    await db.commit()
    matches = await get_matches(db, user, limit=20, explain=False)
    return {"refreshed": True, "total_matches": matches.total}
