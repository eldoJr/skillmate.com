from pydantic import BaseModel, field_validator
from datetime import datetime
from src.schemas.user import PublicUserResponse
from src.schemas.skill import SkillResponse
from src.models.listing import ListingType


class ListingCreate(BaseModel):
    title:         str
    description:   str
    category:      str
    listing_type:  ListingType = ListingType.service
    price:         float | None = None
    price_min:     float | None = None
    price_max:     float | None = None
    delivery_days: int | None = None
    skill_ids:     list[str] = []

    @field_validator("title")
    @classmethod
    def title_length(cls, v: str) -> str:
        if len(v.strip()) < 5:
            raise ValueError("Title must be at least 5 characters")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_length(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError("Description must be at least 20 characters")
        return v.strip()


class ListingUpdate(BaseModel):
    title:         str | None = None
    description:   str | None = None
    category:      str | None = None
    price:         float | None = None
    price_min:     float | None = None
    price_max:     float | None = None
    delivery_days: int | None = None
    skill_ids:     list[str] | None = None


class ListingResponse(BaseModel):
    id:            str
    owner_id:      str
    title:         str
    description:   str
    category:      str
    listing_type:  str
    price:         float | None
    price_min:     float | None
    price_max:     float | None
    delivery_days: int | None
    cover_image:   str | None
    is_active:     bool
    skills:        list[SkillResponse]
    owner:         PublicUserResponse
    created_at:    datetime
    updated_at:    datetime

    model_config = {"from_attributes": True}


class ListingFilters(BaseModel):
    category:      str | None = None
    listing_type:  ListingType | None = None
    skill_id:      str | None = None
    min_price:     float | None = None
    max_price:     float | None = None
    university:    str | None = None
    search:        str | None = None
    page:          int = 1
    page_size:     int = 20

    @field_validator("page_size")
    @classmethod
    def cap_page_size(cls, v: int) -> int:
        return min(v, 100)


class PaginatedListings(BaseModel):
    items:      list[ListingResponse]
    total:      int
    page:       int
    page_size:  int
    pages:      int
