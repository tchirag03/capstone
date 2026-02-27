"""
Evaluation management API routes.
"""
from fastapi import APIRouter
from app.schemas.evaluation import (
    CreateEvaluationRequest,
    EvaluationResponse,
    EvaluationListResponse,
    DeleteEvaluationResponse,
)

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])


@router.post("", response_model=EvaluationResponse)
async def create_evaluation(request: CreateEvaluationRequest):
    """Create a new evaluation"""
    return EvaluationResponse(
        id="eval-" + request.name.lower().replace(" ", "-"),
        name=request.name,
        subject=request.subject,
        max_marks=request.max_marks,
        answer_type=request.answer_type,
        status="draft"
    )


@router.get("", response_model=EvaluationListResponse)
async def list_evaluations():
    """List all evaluations"""
    return EvaluationListResponse(
        success=True,
        evaluations=[]
    )


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(evaluation_id: str):
    """Get evaluation by ID"""
    return EvaluationResponse(
        id=evaluation_id,
        name="Mock Evaluation",
        subject="Computer Science",
        max_marks=100,
        answer_type="printed",
        status="draft"
    )


@router.delete("/{evaluation_id}", response_model=DeleteEvaluationResponse)
async def delete_evaluation(evaluation_id: str):
    """Delete an evaluation"""
    return DeleteEvaluationResponse(
        success=True,
        deleted=evaluation_id,
        message=f"Evaluation {evaluation_id} deleted successfully"
    )
