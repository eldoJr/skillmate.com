from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.db.session import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.models.listing import Listing
from src.schemas.listing import ListingCreate, ListingResponse

router = APIRouter()


@router.get("/", response_model=list[ListingResponse])
async def get_listings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Listing).where(Listing.is_active == True))
    return result.scalars().all()


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = Listing(**payload.model_dump(), owner_id=current_user.id)
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    return listing


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Listing not found")
    await db.delete(listing)
    await db.commit()
