"""
Answer sheet management API routes.
Handles real file uploads, local disk storage, and MongoDB metadata.
"""
import os
import shutil
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.core.mongodb import get_database
from app.schemas.sheet import (
    DeleteSheetResponse,
    ListSheetsResponse,
    SheetMetadata,
    UploadedSheetInfo,
    UploadSheetsResponse,
)

router = APIRouter(tags=["Sheets"])

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf"}


def _validate_extension(filename: str) -> None:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )


def _ensure_upload_dir(evaluation_id: str) -> str:
    """Create and return the upload directory for an evaluation."""
    upload_path = os.path.join(settings.upload_dir, evaluation_id)
    os.makedirs(upload_path, exist_ok=True)
    return upload_path


# ---------------------------------------------------------------------------
# POST  /evaluations/{evaluation_id}/sheets  —  upload answer sheets (bulk)
# ---------------------------------------------------------------------------
@router.post(
    "/evaluations/{evaluation_id}/sheets",
    response_model=UploadSheetsResponse,
)
async def upload_sheets(
    evaluation_id: str,
    files: list[UploadFile] = File(..., description="One or more answer sheet images/PDFs"),
):
    """Upload answer sheets for a given evaluation.

    • Saves each file to  uploads/<evaluation_id>/
    • Inserts a metadata document into the MongoDB `sheets` collection
    """
    db = get_database()

    # Ensure the evaluation exists
    evaluation = await db.evaluations.find_one({"_id": ObjectId(evaluation_id)})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    upload_dir = _ensure_upload_dir(evaluation_id)
    uploaded: list[UploadedSheetInfo] = []

    for file in files:
        _validate_extension(file.filename or "unknown.bin")

        # Persist to disk
        dest_path = os.path.join(upload_dir, file.filename)
        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        file_size = os.path.getsize(dest_path)

        # Insert metadata into MongoDB
        doc = {
            "evaluation_id": evaluation_id,
            "file_name": file.filename,
            "file_size": file_size,
            "file_path": dest_path,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "status": "uploaded",
        }
        result = await db.sheets.insert_one(doc)

        uploaded.append(
            UploadedSheetInfo(
                sheet_id=str(result.inserted_id),
                file_name=file.filename,
                file_size=file_size,
                status="uploaded",
            )
        )

    return UploadSheetsResponse(
        success=True,
        uploaded_sheets=uploaded,
        message=f"{len(uploaded)} sheet(s) uploaded successfully",
    )


# ---------------------------------------------------------------------------
# POST  /evaluations/{evaluation_id}/rubric  —  upload rubric document
# ---------------------------------------------------------------------------
@router.post("/evaluations/{evaluation_id}/rubric")
async def upload_rubric(
    evaluation_id: str,
    file: UploadFile = File(..., description="Rubric document (PDF/DOC/TXT)"),
):
    """Upload a rubric file for an evaluation."""
    db = get_database()

    evaluation = await db.evaluations.find_one({"_id": ObjectId(evaluation_id)})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    rubric_dir = os.path.join(settings.upload_dir, evaluation_id, "rubric")
    os.makedirs(rubric_dir, exist_ok=True)

    dest_path = os.path.join(rubric_dir, file.filename)
    with open(dest_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size = os.path.getsize(dest_path)

    doc = {
        "evaluation_id": evaluation_id,
        "file_name": file.filename,
        "file_size": file_size,
        "file_path": dest_path,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }

    # Upsert — one rubric per evaluation
    await db.rubrics.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": doc},
        upsert=True,
    )

    return {
        "success": True,
        "file_name": file.filename,
        "file_size": file_size,
        "message": "Rubric uploaded successfully",
    }


# ---------------------------------------------------------------------------
# GET  /evaluations/{evaluation_id}/sheets  —  list uploaded sheets
# ---------------------------------------------------------------------------
@router.get(
    "/evaluations/{evaluation_id}/sheets",
    response_model=ListSheetsResponse,
)
async def list_sheets(evaluation_id: str):
    """List all uploaded sheets for an evaluation."""
    db = get_database()
    cursor = db.sheets.find({"evaluation_id": evaluation_id})
    sheets: list[SheetMetadata] = []

    async for doc in cursor:
        sheets.append(
            SheetMetadata(
                id=str(doc["_id"]),
                evaluation_id=doc["evaluation_id"],
                file_name=doc["file_name"],
                file_size=doc["file_size"],
                file_path=doc["file_path"],
                uploaded_at=doc["uploaded_at"],
                status=doc.get("status", "uploaded"),
            )
        )

    return ListSheetsResponse(success=True, sheets=sheets)


# ---------------------------------------------------------------------------
# DELETE  /evaluations/{evaluation_id}/sheets/{sheet_id}
# ---------------------------------------------------------------------------
@router.delete(
    "/evaluations/{evaluation_id}/sheets/{sheet_id}",
    response_model=DeleteSheetResponse,
)
async def delete_sheet(evaluation_id: str, sheet_id: str):
    """Delete a specific sheet — removes file from disk and metadata from MongoDB."""
    db = get_database()

    doc = await db.sheets.find_one({"_id": ObjectId(sheet_id), "evaluation_id": evaluation_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Sheet not found")

    # Remove file from disk (ignore if already gone)
    file_path = doc.get("file_path", "")
    if os.path.exists(file_path):
        os.remove(file_path)

    await db.sheets.delete_one({"_id": ObjectId(sheet_id)})

    return DeleteSheetResponse(
        success=True,
        message=f"Sheet '{doc['file_name']}' deleted successfully",
    )
