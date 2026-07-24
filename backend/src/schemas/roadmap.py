import json
from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import datetime


class RoadmapRequest(BaseModel):
    target_role: str


class Milestone(BaseModel):
    title: str
    description: str
    skills: list[str]
    week_start: int
    week_end: int
    certifications: list[str] = []
    projects: list[str] = []


class WeekPlan(BaseModel):
    week: int
    focus: str
    tasks: list[str]
    resources: list[str] = []


class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    version: int
    milestones: list[Milestone]
    weekly_plan: list[WeekPlan]
    summary: str
    total_weeks: int
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_json_fields(cls, data):
        for field in ("milestones", "weekly_plan"):
            val = getattr(data, field, None) if hasattr(data, field) else data.get(field)
            if isinstance(val, str):
                parsed = json.loads(val)
                if hasattr(data, field):
                    object.__setattr__(data, field, parsed)
                else:
                    data[field] = parsed
        return data


class RoadmapVersionBrief(BaseModel):
    id: str
    version: int
    target_role: str
    total_weeks: int
    created_at: datetime

    model_config = {"from_attributes": True}
