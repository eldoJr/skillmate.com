from pydantic import BaseModel
from datetime import date, datetime


class CertificateCreate(BaseModel):
    title: str
    issuer: str
    issue_date: date
    expiry_date: date | None = None
    credential_id: str | None = None
    credential_url: str | None = None
    description: str | None = None


class CertificateUpdate(BaseModel):
    title: str | None = None
    issuer: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    credential_id: str | None = None
    credential_url: str | None = None
    description: str | None = None


class CertificateResponse(BaseModel):
    id: str
    user_id: str
    title: str
    issuer: str
    issue_date: date
    expiry_date: date | None
    credential_id: str | None
    credential_url: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
