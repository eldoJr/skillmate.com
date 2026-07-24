import json
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import datetime


class PortfolioCreate(BaseModel):
    title: str
    summary: Optional[str] = None
    impact_statement: Optional[str] = None
    technologies: Optional[list[str]] = None
    project_url: Optional[str] = None


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    impact_statement: Optional[str] = None
    technologies: Optional[list[str]] = None
    project_url: Optional[str] = None


class PortfolioResponse(BaseModel):
    id: str
    user_id: str
    title: str
    summary: Optional[str] = None
    impact_statement: Optional[str] = None
    technologies: Optional[list[str]] = None
    project_url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_technologies(cls, data):
        # When coming from ORM, technologies is a JSON string
        if hasattr(data, "technologies") and isinstance(data.technologies, str):
            try:
                object.__setattr__(data, "technologies", json.loads(data.technologies))
            except (ValueError, TypeError):
                object.__setattr__(data, "technologies", [])
        return data


class ImageResponse(BaseModel):
    image_url: str


class AnalyzeResponse(BaseModel):
    entry: PortfolioResponse
    extracted_text_length: int
    source_filename: str
