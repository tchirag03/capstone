"""
Answer sheet schemas for upload and management.
"""
from pydantic import BaseModel


class SheetResponse(BaseModel):
    """Response schema for sheet data"""
    sheet_id: str
    status: str = "uploaded"
    file_name: str | None = None


class SheetListResponse(BaseModel):
    """Response schema for listing sheets"""
    success: bool = True
    sheets: list[SheetResponse]


class DeleteSheetResponse(BaseModel):
    """Response schema for sheet deletion"""
    success: bool = True
    deleted: str
    message: str
