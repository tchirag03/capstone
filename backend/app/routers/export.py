"""
Export API routes.
Generates real CSV and PDF exports from evaluated sheet data.
"""
import csv
import io
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.mongodb import get_database

router = APIRouter(tags=["Export"])


# ---------------------------------------------------------------------------
# POST  /evaluations/{evaluation_id}/export/csv
# ---------------------------------------------------------------------------
@router.post("/evaluations/{evaluation_id}/export/csv")
async def export_csv(evaluation_id: str):
    """Export evaluation results as CSV."""
    db = get_database()

    evaluation = await db.evaluations.find_one({"_id": ObjectId(evaluation_id)})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    sheets = await db.sheets.find(
        {
            "evaluation_id": evaluation_id,
            "status": "evaluation-completed",
            "evaluation_result": {"$exists": True},
        }
    ).to_list(length=None)

    if not sheets:
        raise HTTPException(
            status_code=400,
            detail="No evaluated sheets to export.",
        )

    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "Student Name",
        "File Name",
        "Total Score",
        "Max Score",
        "Percentage",
        "Grade",
        "Questions Evaluated",
    ])

    for sheet in sheets:
        result = sheet.get("evaluation_result", {})
        writer.writerow([
            sheet.get("student_name", "Unknown"),
            sheet.get("file_name", ""),
            result.get("total_score", 0),
            result.get("max_score", 0),
            result.get("percentage", 0),
            result.get("grade", "N/A"),
            len(result.get("questions", [])),
        ])

    output.seek(0)
    eval_name = evaluation.get("name", evaluation_id)
    filename = f"{eval_name}_results.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# POST  /evaluations/{evaluation_id}/export/pdf
# ---------------------------------------------------------------------------
@router.post("/evaluations/{evaluation_id}/export/pdf")
async def export_pdf(evaluation_id: str):
    """Export evaluation results as PDF.

    Uses reportlab if available, otherwise returns a formatted text file.
    """
    db = get_database()

    evaluation = await db.evaluations.find_one({"_id": ObjectId(evaluation_id)})
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    sheets = await db.sheets.find(
        {
            "evaluation_id": evaluation_id,
            "status": "evaluation-completed",
            "evaluation_result": {"$exists": True},
        }
    ).to_list(length=None)

    if not sheets:
        raise HTTPException(
            status_code=400,
            detail="No evaluated sheets to export.",
        )

    try:
        return _generate_pdf(evaluation, sheets)
    except ImportError:
        # reportlab not installed — fall back to plain text report
        return _generate_text_report(evaluation, sheets)


def _generate_pdf(evaluation: dict, sheets: list[dict]) -> StreamingResponse:
    """Generate a PDF report using reportlab."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer,
    )
    from reportlab.lib.styles import getSampleStyleSheet

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    eval_name = evaluation.get("name", "Evaluation")
    elements.append(Paragraph(f"<b>{eval_name} — Results Report</b>", styles["Title"]))
    elements.append(Spacer(1, 6 * mm))
    elements.append(Paragraph(
        f"Subject: {evaluation.get('subject', 'N/A')} | "
        f"Max Marks: {evaluation.get('max_marks', 'N/A')} | "
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        styles["Normal"],
    ))
    elements.append(Spacer(1, 8 * mm))

    # Summary table
    data = [["Student", "Score", "Max", "%", "Grade"]]
    for s in sheets:
        r = s.get("evaluation_result", {})
        data.append([
            s.get("student_name", "Unknown"),
            str(r.get("total_score", 0)),
            str(r.get("max_score", 0)),
            f"{r.get('percentage', 0)}%",
            r.get("grade", "N/A"),
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
    ]))
    elements.append(table)

    doc.build(elements)
    buf.seek(0)

    eval_name_safe = eval_name.replace(" ", "_")
    filename = f"{eval_name_safe}_results.pdf"

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _generate_text_report(evaluation: dict, sheets: list[dict]) -> StreamingResponse:
    """Fallback plain-text report when reportlab is not installed."""
    lines = []
    eval_name = evaluation.get("name", "Evaluation")
    lines.append(f"{'=' * 50}")
    lines.append(f"  {eval_name} — Results Report")
    lines.append(f"  Subject: {evaluation.get('subject', 'N/A')}")
    lines.append(f"  Max Marks: {evaluation.get('max_marks', 'N/A')}")
    lines.append(f"{'=' * 50}\n")

    lines.append(f"{'Student':<25} {'Score':>6} {'Max':>6} {'%':>7} {'Grade':>6}")
    lines.append("-" * 55)

    for s in sheets:
        r = s.get("evaluation_result", {})
        lines.append(
            f"{s.get('student_name', 'Unknown'):<25} "
            f"{r.get('total_score', 0):>6.1f} "
            f"{r.get('max_score', 0):>6.1f} "
            f"{r.get('percentage', 0):>6.1f}% "
            f"{r.get('grade', 'N/A'):>6}"
        )

    content = "\n".join(lines)
    filename = f"{eval_name.replace(' ', '_')}_results.txt"

    return StreamingResponse(
        iter([content]),
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
