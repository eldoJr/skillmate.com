import io
import json
import os
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jinja2 import Template
from docx import Document
from docx.shared import Pt, RGBColor
from src.models.user import User
from src.models.portfolio import Portfolio
from src.schemas.review import AggregateScores
from src.services.reviews import get_aggregate
from src.ai.resume import generate_resume_content, RESUME_HTML_TEMPLATE


async def _build_resume_context(db: AsyncSession, user: User) -> dict:
    portfolio_rows = await db.scalars(
        select(Portfolio).where(Portfolio.user_id == user.id).order_by(Portfolio.created_at.desc())
    )
    portfolio = []
    for p in portfolio_rows.all():
        techs = []
        if p.technologies:
            try:
                techs = json.loads(p.technologies)
            except ValueError:
                pass
        portfolio.append({
            "title": p.title,
            "summary": p.summary,
            "impact_statement": p.impact_statement,
            "technologies": techs,
            "project_url": p.project_url,
        })

    agg = await get_aggregate(db, user.id)

    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "university": user.university or "",
        "role": user.role or "",
        "headline": user.headline or "",
        "bio": user.bio or "",
        "portfolio_url": user.portfolio_url or "",
        "skills": [s.name for s in (user.skills or [])],
        "portfolio": portfolio,
        "aggregate_scores": agg.model_dump(),
    }


async def generate_pdf(db: AsyncSession, user: User) -> StreamingResponse:
    try:
        from weasyprint import HTML
    except OSError as e:
        raise HTTPException(status_code=501, detail=f"PDF generation unavailable on this platform: {e}")

    context = await _build_resume_context(db, user)
    generated = await generate_resume_content(context)
    context.update(generated)

    html_content = Template(RESUME_HTML_TEMPLATE).render(**context)
    pdf_bytes = HTML(string=html_content).write_pdf()

    filename = f"{user.first_name}_{user.last_name}_resume.pdf".replace(" ", "_")
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


async def generate_docx(db: AsyncSession, user: User) -> StreamingResponse:
    context = await _build_resume_context(db, user)
    generated = await generate_resume_content(context)
    context.update(generated)

    doc = Document()

    # Name + tagline
    name_para = doc.add_paragraph()
    run = name_para.add_run(f"{context['first_name']} {context['last_name']}")
    run.bold = True
    run.font.size = Pt(20)

    if context.get("tagline"):
        doc.add_paragraph(context["tagline"])

    meta_parts = [p for p in [context["university"], context["role"]] if p]
    if meta_parts:
        doc.add_paragraph(" · ".join(meta_parts))

    # Biography
    if context.get("biography"):
        doc.add_heading("About", level=2)
        doc.add_paragraph(context["biography"])

    # Skills
    if context["skills"]:
        doc.add_heading("Skills", level=2)
        doc.add_paragraph(", ".join(context["skills"]))

    # Projects
    if context["portfolio"]:
        doc.add_heading("Projects", level=2)
        for project in context["portfolio"]:
            p = doc.add_paragraph()
            run = p.add_run(project["title"])
            run.bold = True
            if project.get("technologies"):
                doc.add_paragraph(", ".join(project["technologies"])).italic = True
            if project.get("summary"):
                doc.add_paragraph(project["summary"])
            if project.get("impact_statement"):
                doc.add_paragraph(project["impact_statement"])

    # Reputation
    agg = context["aggregate_scores"]
    if agg.get("total_reviews", 0) > 0:
        doc.add_heading("Reputation", level=2)
        doc.add_paragraph(
            f"Overall: {agg['overall_avg']}/5  |  "
            f"Reliability: {agg['avg_reliability']}  |  "
            f"Professionalism: {agg['avg_professionalism']}  |  "
            f"Growth: {agg['avg_growth']}  |  "
            f"Reviews: {agg['total_reviews']}"
        )

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    filename = f"{context['first_name']}_{context['last_name']}_resume.docx".replace(" ", "_")
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
