import json
from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import datetime
from src.schemas.user import PublicUserResponse
from src.schemas.review import AggregateScores


class RequirementCreate(BaseModel):
    company_name: str
    role_title: str
    description: str
    required_skills: list[str]
    preferred_university: Optional[str] = None


class RequirementResponse(BaseModel):
    id: str
    posted_by: str
    company_name: str
    role_title: str
    description: str
    required_skills: list[str]
    preferred_university: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def parse_skills(cls, data):
        val = getattr(data, "required_skills", None) if hasattr(data, "required_skills") else data.get("required_skills")
        if isinstance(val, str):
            parsed = json.loads(val)
            if hasattr(data, "required_skills"):
                object.__setattr__(data, "required_skills", parsed)
            else:
                data["required_skills"] = parsed
        return data


class CandidateResult(BaseModel):
    student: PublicUserResponse
    vector_score: float
    reputation_score: float
    activity_score: float
    final_score: float
    scores: AggregateScores
    summary: Optional[str] = None


class MatchResponse(BaseModel):
    requirement: RequirementResponse
    candidates: list[CandidateResult]
    total: int
