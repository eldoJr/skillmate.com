from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    body: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedNotifications(BaseModel):
    items: list[NotificationResponse]
    total: int
    page: int
    pages: int


class UnreadCountResponse(BaseModel):
    unread: int
