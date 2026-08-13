import uuid
from math import ceil
from pathlib import Path
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from src.models.listing import Listing
from src.models.skill import Skill
from src.models.user import User
from src.schemas.listing import ListingCreate, ListingUpdate, ListingFilters, PaginatedListings

COVER_DIR = Path("media/listings")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8MB


def _base_query():
    return select(Listing).where(Listing.is_deleted == False, Listing.is_active == True)


async def _get_skills(db: AsyncSession, skill_ids: list[str]) -> list[Skill]:
    if not skill_ids:
        return []
    # Accept both UUIDs and skill names (frontend sends names)
    result = await db.execute(
        select(Skill).where(or_(Skill.id.in_(skill_ids), Skill.name.in_(skill_ids)))
    )
    return list(result.scalars().all())


async def get_listings(db: AsyncSession, filters: ListingFilters) -> PaginatedListings:
    query = _base_query()

    if filters.category:
        query = query.where(func.lower(Listing.category) == filters.category.lower())
    if filters.listing_type:
        query = query.where(Listing.listing_type == filters.listing_type)
    if filters.min_price is not None:
        query = query.where(Listing.price >= filters.min_price)
    if filters.max_price is not None:
        query = query.where(Listing.price <= filters.max_price)
    if filters.skill_id:
        query = query.where(Listing.skills.any(Skill.id == filters.skill_id))
    if filters.university:
        query = query.join(User, Listing.owner_id == User.id).where(
            func.lower(User.university) == filters.university.lower()
        )
    if filters.search:
        term = f"%{filters.search.lower()}%"
        query = query.where(
            or_(
                func.lower(Listing.title).like(term),
                func.lower(Listing.description).like(term),
            )
        )

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    offset = (filters.page - 1) * filters.page_size
    query = query.order_by(Listing.created_at.desc()).offset(offset).limit(filters.page_size)

    result = await db.execute(query)
    items = result.scalars().all()

    return PaginatedListings(
        items=items,
        total=total,
        page=filters.page,
        page_size=filters.page_size,
        pages=ceil(total / filters.page_size) if total else 0,
    )


async def get_listing(db: AsyncSession, listing_id: str) -> Listing:
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id, Listing.is_deleted == False)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return listing


async def get_my_listings(db: AsyncSession, owner_id: str) -> list[Listing]:
    result = await db.execute(
        select(Listing)
        .where(Listing.owner_id == owner_id, Listing.is_deleted == False)
        .order_by(Listing.created_at.desc())
    )
    return result.scalars().all()


async def create_listing(db: AsyncSession, owner_id: str, payload: ListingCreate) -> Listing:
    skills = await _get_skills(db, payload.skill_ids)

    listing = Listing(
        owner_id=owner_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        listing_type=payload.listing_type,
        price=payload.price,
        price_min=payload.price_min,
        price_max=payload.price_max,
        delivery_days=payload.delivery_days,
        skills=skills,
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    from src.tasks.embeddings import generate_listing_embedding
    generate_listing_embedding.delay(listing.id)
    from src.tasks.search_sync import sync_listing_to_meili
    sync_listing_to_meili.delay(listing.id)
    return listing


async def update_listing(db: AsyncSession, listing_id: str, owner_id: str, payload: ListingUpdate) -> Listing:
    listing = await get_listing(db, listing_id)

    if listing.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    data = payload.model_dump(exclude_unset=True)
    skill_ids = data.pop("skill_ids", None)

    for field, value in data.items():
        setattr(listing, field, value)

    if skill_ids is not None:
        listing.skills = await _get_skills(db, skill_ids)

    await db.commit()
    await db.refresh(listing)
    from src.tasks.embeddings import generate_listing_embedding
    generate_listing_embedding.delay(listing.id)
    from src.tasks.search_sync import sync_listing_to_meili
    sync_listing_to_meili.delay(listing.id)
    return listing


async def toggle_active(db: AsyncSession, listing_id: str, owner_id: str) -> Listing:
    listing = await get_listing(db, listing_id)

    if listing.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    listing.is_active = not listing.is_active
    await db.commit()
    await db.refresh(listing)
    return listing


async def delete_listing(db: AsyncSession, listing_id: str, owner_id: str) -> None:
    listing = await get_listing(db, listing_id)

    if listing.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    listing.is_deleted = True
    listing.is_active = False
    await db.commit()


async def upload_cover(db: AsyncSession, listing_id: str, owner_id: str, file: UploadFile) -> Listing:
    listing = await get_listing(db, listing_id)

    if listing.owner_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, and WebP images are allowed")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image must be under 8MB")

    COVER_DIR.mkdir(parents=True, exist_ok=True)

    if listing.cover_image:
        old = Path(listing.cover_image.lstrip("/"))
        if old.exists():
            old.unlink()

    ext = file.content_type.split("/")[-1]
    filename = f"{listing_id}_{uuid.uuid4().hex}.{ext}"
    (COVER_DIR / filename).write_bytes(contents)

    listing.cover_image = f"/media/listings/{filename}"
    await db.commit()
    await db.refresh(listing)
    return listing
