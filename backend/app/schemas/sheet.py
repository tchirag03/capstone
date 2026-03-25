"""
Answer sheet schemas for upload and management.
Matches the frontend contract defined in api/sheets.ts.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# --- Status literal matching frontend ---
SheetStatus = Literal[
    "uploaded",
    "ocr-pending",
    "ocr-processing",
    "ocr-completed",
    "ocr-failed",
    "structuring-pending",
    "structuring-processing",
    "structuring-completed",
    "structuring-failed",
    "evaluated",
    "error",
]


# --- Upload response (returned per-file after upload) ---
class UploadedSheetInfo(BaseModel):
    sheet_id: str
    file_name: str
    file_size: int
    status: SheetStatus = "uploaded"


class UploadSheetsResponse(BaseModel):
    success: bool = True
    uploaded_sheets: list[UploadedSheetInfo]
    message: str


# --- Full metadata (stored in MongoDB, returned by GET) ---
class SheetMetadata(BaseModel):
    id: str
    evaluation_id: str
    file_name: str
    file_size: int
    file_path: str
    uploaded_at: str  # ISO-8601 string
    status: SheetStatus = "uploaded"


class ListSheetsResponse(BaseModel):
    success: bool = True
    sheets: list[SheetMetadata]


# --- Delete ---
class DeleteSheetResponse(BaseModel):
    success: bool = True
    message: str
