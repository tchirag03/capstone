"""
Text structuring API routes.
"""
from fastapi import APIRouter
from app.schemas.common import SuccessResponse, StatusResponse

router = APIRouter(tags=["Structuring"])


@router.post("/evaluations/{evaluation_id}/structuring/start", response_model=SuccessResponse)
async def start_structuring(evaluation_id: str):
    """Start text structuring"""
    return SuccessResponse(
        success=True,
        message=f"Text structuring started for evaluation {evaluation_id}"
    )


@router.get("/evaluations/{evaluation_id}/structuring/status", response_model=StatusResponse)
async def get_structuring_status(evaluation_id: str):
    """Get structuring status"""
    return StatusResponse(
        success=True,
        status="pending",
        progress={
            "total": 0,
            "completed": 0,
            "percentage": 0
        }
    )


@router.get("/evaluations/{evaluation_id}/structuring/result/{sheet_id}")
async def get_structuring_result(evaluation_id: str, sheet_id: str):
    """Get structured text for a sheet"""
    return {
        "success": True,
        "sheet_id": sheet_id,
        "status": "pending",
        "structured_text": {}
    }
