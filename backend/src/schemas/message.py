from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class SendMessage(BaseModel):
    receiver_id: str
    content: str

    @field_validator("content")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message content cannot be empty")
        return v


class UserBrief(BaseModel):
    id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: str
    sender: UserBrief
    receiver_id: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    partner: UserBrief
    last_message: str
    last_message_at: datetime
    unread_count: int


class UnreadCountResponse(BaseModel):
    unread: int
