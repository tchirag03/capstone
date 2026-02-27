"""
Answer sheet management API routes.
"""
from fastapi import APIRouter
from app.schemas.sheet import (
    SheetResponse,
    SheetListResponse,
    DeleteSheetResponse,
)

router = APIRouter(tags=["Sheets"])


@router.post("/evaluations/{evaluation_id}/sheets", response_model=SheetResponse)
async def upload_sheets(evaluation_id: str):
    """Upload answer sheets (mock - no actual file handling)"""
    return SheetResponse(
        sheet_id=f"sheet-{evaluation_id}-001",
        status="uploaded",
        file_name="mock_answer_sheet.jpg"
    )


@router.get("/evaluations/{evaluation_id}/sheets", response_model=SheetListResponse)
async def list_sheets(evaluation_id: str):
    """List uploaded sheets"""
    return SheetListResponse(
        success=True,
        sheets=[]
    )


@router.delete("/evaluations/{evaluation_id}/sheets/{sheet_id}", response_model=DeleteSheetResponse)
async def delete_sheet(evaluation_id: str, sheet_id: str):
    """Delete a specific sheet"""
    return DeleteSheetResponse(
        success=True,
        deleted=sheet_id,
        message=f"Sheet {sheet_id} deleted successfully"
    )
