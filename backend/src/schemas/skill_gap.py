import json
from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import datetime


class SkillGapRequest(BaseModel):
    target_role: str


class MissingSkill(BaseModel):
    skill: str
    priority: int       # 1 = highest
    reason: str
    estimated_weeks: int


class SkillGapReportResponse(BaseModel):
    id: str
    user_id: str
    target_role: str
    present_skills: list[str]
    missing_skills: list[MissingSkill]
    summary: str
    estimated_weeks: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_json_fields(cls, data):
        for field in ("missing_skills", "present_skills"):
            val = getattr(data, field, None) if hasattr(data, field) else data.get(field)
            if isinstance(val, str):
                parsed = json.loads(val)
                if hasattr(data, field):
                    object.__setattr__(data, field, parsed)
                else:
                    data[field] = parsed
        return data
