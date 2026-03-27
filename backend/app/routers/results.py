"""
Results and feedback API routes.
Aggregates real evaluation data from MongoDB.
"""
from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.core.mongodb import get_database

router = APIRouter(tags=["Results"])


# ---------------------------------------------------------------------------
# GET  /evaluations/{evaluation_id}/results  — summary
# ---------------------------------------------------------------------------
@router.get("/evaluations/{evaluation_id}/results")
async def get_results_summary(evaluation_id: str):
    """Get aggregated results for an evaluation."""
    db = get_database()

    # Validate evaluation
    evaluation = await db.evaluations.find_one({"_id": ObjectId(evaluation_id)})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    # Aggregate scores from evaluated sheets
    pipeline = [
        {
            "$match": {
                "evaluation_id": evaluation_id,
                "status": "evaluation-completed",
                "evaluation_result": {"$exists": True},
            }
        },
        {
            "$project": {
                "student_name": {"$ifNull": ["$student_name", "Unknown"]},
                "file_name": 1,
                "total_score": "$evaluation_result.total_score",
                "max_score": "$evaluation_result.max_score",
                "percentage": "$evaluation_result.percentage",
                "grade": "$evaluation_result.grade",
            }
        },
        {"$sort": {"percentage": -1}},
    ]

    results = await db.sheets.aggregate(pipeline).to_list(length=None)

    if not results:
        return {
            "success": True,
            "evaluation_id": evaluation_id,
            "summary": {
                "total_students": 0,
                "average_score": 0,
                "highest_score": 0,
                "lowest_score": 0,
                "average_percentage": 0,
            },
            "results": [],
        }

    scores = [r["total_score"] for r in results]
    percentages = [r["percentage"] for r in results]

    # Stringify _id for JSON serialisation
    for r in results:
        r["_id"] = str(r["_id"])

    return {
        "success": True,
        "evaluation_id": evaluation_id,
        "summary": {
            "total_students": len(results),
            "average_score": round(sum(scores) / len(scores), 1),
            "highest_score": round(max(scores), 1),
            "lowest_score": round(min(scores), 1),
            "average_percentage": round(sum(percentages) / len(percentages), 1),
        },
        "results": results,
    }


# ---------------------------------------------------------------------------
# GET  /evaluations/{evaluation_id}/results/{sheet_id}  — detailed
# ---------------------------------------------------------------------------
@router.get("/evaluations/{evaluation_id}/results/{sheet_id}")
async def get_detailed_result(evaluation_id: str, sheet_id: str):
    """Get detailed per-question breakdown for a sheet."""
    db = get_database()

    doc = await db.sheets.find_one(
        {"_id": ObjectId(sheet_id), "evaluation_id": evaluation_id}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Sheet not found")

    eval_result = doc.get("evaluation_result")
    if not eval_result:
        return {
            "success": True,
            "sheet_id": sheet_id,
            "status": doc.get("status", "pending"),
            "message": "Evaluation not yet completed for this sheet.",
        }

    return {
        "success": True,
        "sheet_id": sheet_id,
        "student": {
            "name": doc.get("student_name", "Unknown"),
            "file_name": doc.get("file_name", ""),
        },
        "evaluation": eval_result,
    }
