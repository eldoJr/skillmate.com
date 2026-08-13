from pydantic import BaseModel


class SkillResponse(BaseModel):
    id: str
    name: str
    category: str

    model_config = {"from_attributes": True}


class SkillsByCategory(BaseModel):
    category: str
    skills: list[SkillResponse]


class SkillCreate(BaseModel):
    name: str
    category: str = "Custom"
