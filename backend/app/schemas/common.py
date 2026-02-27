"""
Common schemas and response models shared across all API endpoints.
"""
from pydantic import BaseModel
from typing import Literal


# Status enums
ProcessingStatus = Literal["pending", "running", "completed", "failed"]


class SuccessResponse(BaseModel):
    """Standard success response"""
    success: bool = True
    message: str


class StatusResponse(BaseModel):
    """Standard status response for async operations"""
    success: bool = True
    status: ProcessingStatus
    progress: dict | None = None
