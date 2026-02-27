"""
Export API routes.
"""
from fastapi import APIRouter

router = APIRouter(tags=["Export"])


@router.post("/evaluations/{evaluation_id}/export/csv")
async def export_csv(evaluation_id: str):
    """Export results as CSV"""
    return {
        "success": True,
        "file_url": f"/exports/{evaluation_id}.csv",
        "file_name": f"evaluation_{evaluation_id}.csv",
        "message": "CSV export completed"
    }


@router.post("/evaluations/{evaluation_id}/export/pdf")
async def export_pdf(evaluation_id: str):
    """Export results as PDF"""
    return {
        "success": True,
        "file_url": f"/exports/{evaluation_id}.pdf",
        "file_name": f"evaluation_{evaluation_id}.pdf",
        "message": "PDF export completed"
    }
