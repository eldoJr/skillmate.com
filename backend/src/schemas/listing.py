from pydantic import BaseModel
from datetime import datetime


class ListingCreate(BaseModel):
    title: str
    description: str
    category: str
    price: float | None = None


class ListingResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    description: str
    category: str
    price: float | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
