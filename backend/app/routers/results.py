"""
Results and feedback API routes.
"""
from fastapi import APIRouter

router = APIRouter(tags=["Results"])


@router.get("/evaluations/{evaluation_id}/results")
async def get_results_summary(evaluation_id: str):
    """Get summary results for evaluation"""
    return {
        "success": True,
        "evaluation_id": evaluation_id,
        "summary": {
            "total_students": 0,
            "average_score": 0,
            "highest_score": 0,
            "lowest_score": 0
        },
        "results": []
    }


@router.get("/evaluations/{evaluation_id}/results/{sheet_id}")
async def get_detailed_result(evaluation_id: str, sheet_id: str):
    """Get detailed result for a sheet"""
    return {
        "success": True,
        "sheet_id": sheet_id,
        "student": {
            "roll_no": "MOCK-001",
            "name": "Mock Student"
        },
        "evaluation": {
            "total_score": 0,
            "maximum_score": 100,
            "percentage": 0,
            "grade": "N/A"
        }
    }
