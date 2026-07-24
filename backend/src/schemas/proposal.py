from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from src.models.proposal import ProposalStatus


class ProposalGenerateRequest(BaseModel):
    listing_id: str


class ProposalUpdate(BaseModel):
    intro: Optional[str] = None
    understanding: Optional[str] = None
    plan: Optional[str] = None
    timeline: Optional[str] = None
    pricing: Optional[str] = None


class ProposalResponse(BaseModel):
    id: str
    owner_id: str
    listing_id: str
    status: str
    intro: str
    understanding: str
    plan: str
    timeline: str
    pricing: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProposalBrief(BaseModel):
    id: str
    listing_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
