"""
SLM evaluation API routes.
"""
from fastapi import APIRouter
from app.schemas.common import SuccessResponse, StatusResponse

router = APIRouter(tags=["Evaluation"])


@router.post("/evaluations/{evaluation_id}/evaluation/start", response_model=SuccessResponse)
async def start_evaluation(evaluation_id: str):
    """Start SLM-based evaluation"""
    return SuccessResponse(
        success=True,
        message=f"SLM evaluation started for evaluation {evaluation_id}"
    )


@router.get("/evaluations/{evaluation_id}/evaluation/status", response_model=StatusResponse)
async def get_evaluation_status(evaluation_id: str):
    """Get evaluation status"""
    return StatusResponse(
        success=True,
        status="pending",
        progress={
            "total": 0,
            "completed": 0,
            "percentage": 0
        }
    )


@router.get("/evaluations/{evaluation_id}/evaluation/result/{sheet_id}")
async def get_evaluation_result(evaluation_id: str, sheet_id: str):
    """Get evaluation result for a sheet"""
    return {
        "success": True,
        "sheet_id": sheet_id,
        "status": "pending",
        "result": {}
    }
