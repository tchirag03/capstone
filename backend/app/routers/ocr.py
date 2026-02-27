"""
OCR processing API routes.
"""
from fastapi import APIRouter
from app.schemas.common import SuccessResponse, StatusResponse

router = APIRouter(tags=["OCR"])


@router.post("/evaluations/{evaluation_id}/ocr/start", response_model=SuccessResponse)
async def start_ocr(evaluation_id: str):
    """Start OCR pipeline"""
    return SuccessResponse(
        success=True,
        message=f"OCR started for evaluation {evaluation_id}"
    )


@router.get("/evaluations/{evaluation_id}/ocr/status", response_model=StatusResponse)
async def get_ocr_status(evaluation_id: str):
    """Get OCR pipeline status"""
    return StatusResponse(
        success=True,
        status="pending",
        progress={
            "total": 0,
            "completed": 0,
            "percentage": 0
        }
    )


@router.get("/evaluations/{evaluation_id}/ocr/result/{sheet_id}")
async def get_ocr_result(evaluation_id: str, sheet_id: str):
    """Get OCR result for a sheet"""
    return {
        "success": True,
        "sheet_id": sheet_id,
        "status": "pending",
        "extracted_text": ""
    }
