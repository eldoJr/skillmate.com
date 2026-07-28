from fastapi import APIRouter, Depends, UploadFile, File, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.core.deps import get_current_user, get_verified_user
from src.models.user import User
from src.models.listing import ListingType
from src.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    ListingFilters,
    PaginatedListings,
)
import src.services.listings as listings_service

router = APIRouter()


@router.get("/", response_model=PaginatedListings)
async def get_listings(
    category:     str | None       = Query(None),
    listing_type: ListingType|None = Query(None),
    skill_id:     str | None       = Query(None),
    min_price:    float | None     = Query(None),
    max_price:    float | None     = Query(None),
    university:   str | None       = Query(None),
    search:       str | None       = Query(None),
    page:         int              = Query(1, ge=1),
    page_size:    int              = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    filters = ListingFilters(
        category=category,
        listing_type=listing_type,
        skill_id=skill_id,
        min_price=min_price,
        max_price=max_price,
        university=university,
        search=search,
        page=page,
        page_size=page_size,
    )
    return await listings_service.get_listings(db, filters)


@router.get("/mine", response_model=list[ListingResponse])
async def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await listings_service.get_my_listings(db, current_user.id)


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, db: AsyncSession = Depends(get_db)):
    return await listings_service.get_listing(db, listing_id)


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await listings_service.create_listing(db, current_user.id, payload)


@router.patch("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await listings_service.update_listing(db, listing_id, current_user.id, payload)


@router.post("/{listing_id}/toggle", response_model=ListingResponse)
async def toggle_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await listings_service.toggle_active(db, listing_id, current_user.id)


@router.post("/{listing_id}/cover", response_model=ListingResponse)
async def upload_cover(
    listing_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await listings_service.upload_cover(db, listing_id, current_user.id, file)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await listings_service.delete_listing(db, listing_id, current_user.id)
