"""
Pydantic models for rubric documents.
"""
from pydantic import BaseModel, Field


class RubricComponent(BaseModel):
    name: str
    marks: float


class CreateRubricRequest(BaseModel):
    components: list[RubricComponent]


class RubricResponse(BaseModel):
    id: str = Field(..., alias="_id")
    components: list[RubricComponent]

    class Config:
        populate_by_name = True


class RubricListResponse(BaseModel):
    total: int
    rubrics: list[RubricResponse]
