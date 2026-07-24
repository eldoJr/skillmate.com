import json
import uuid
import os
import aiofiles
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.portfolio import Portfolio
from src.models.user import User
from src.schemas.portfolio import PortfolioCreate, PortfolioUpdate, PortfolioResponse, ImageResponse, AnalyzeResponse
from src.ai.portfolio_analysis import extract_text, analyze_project, SUPPORTED_IMAGE_TYPES, SUPPORTED_DOC_TYPES

MEDIA_DIR = "media/portfolio"
MAX_IMAGE_SIZE = 8 * 1024 * 1024  # 8 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def create_entry(db: AsyncSession, user: User, data: PortfolioCreate) -> PortfolioResponse:
    entry = Portfolio(
        id=str(uuid.uuid4()),
        user_id=user.id,
        title=data.title,
        summary=data.summary,
        impact_statement=data.impact_statement,
        technologies=json.dumps(data.technologies) if data.technologies else None,
        project_url=data.project_url,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    from src.tasks.embeddings import generate_portfolio_embedding
    generate_portfolio_embedding.delay(entry.id)
    return PortfolioResponse.model_validate(entry)


async def get_entries(db: AsyncSession, user_id: str) -> list[PortfolioResponse]:
    result = await db.scalars(
        select(Portfolio)
        .where(Portfolio.user_id == user_id)
        .order_by(Portfolio.created_at.desc())
    )
    return [PortfolioResponse.model_validate(e) for e in result.all()]


async def get_entry(db: AsyncSession, entry_id: str) -> PortfolioResponse:
    entry = await db.get(Portfolio, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")
    return PortfolioResponse.model_validate(entry)


async def update_entry(
    db: AsyncSession, user: User, entry_id: str, data: PortfolioUpdate
) -> PortfolioResponse:
    entry = await db.get(Portfolio, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")
    if entry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your portfolio entry")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "technologies":
            setattr(entry, field, json.dumps(value) if value is not None else None)
        else:
            setattr(entry, field, value)

    await db.commit()
    await db.refresh(entry)
    from src.tasks.embeddings import generate_portfolio_embedding
    generate_portfolio_embedding.delay(entry.id)
    return PortfolioResponse.model_validate(entry)


async def delete_entry(db: AsyncSession, user: User, entry_id: str) -> None:
    entry = await db.get(Portfolio, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")
    if entry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your portfolio entry")
    await db.delete(entry)
    await db.commit()


async def upload_image(
    db: AsyncSession, user: User, entry_id: str, file: UploadFile
) -> ImageResponse:
    entry = await db.get(Portfolio, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Portfolio entry not found")
    if entry.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your portfolio entry")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image exceeds 8 MB limit")

    os.makedirs(MEDIA_DIR, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(MEDIA_DIR, filename)

    async with aiofiles.open(path, "wb") as f:
        await f.write(contents)

    if entry.image_url:
        old_path = entry.image_url.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    entry.image_url = f"/{path}"
    await db.commit()
    return ImageResponse(image_url=entry.image_url)


ALLOWED_ANALYZE_TYPES = SUPPORTED_IMAGE_TYPES | SUPPORTED_DOC_TYPES
MAX_ANALYZE_SIZE = 20 * 1024 * 1024  # 20 MB


async def analyze_file(
    db: AsyncSession, user: User, file: UploadFile
) -> AnalyzeResponse:
    if file.content_type not in ALLOWED_ANALYZE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a JPEG, PNG, WebP, or PDF.",
        )

    contents = await file.read()
    if len(contents) > MAX_ANALYZE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 20 MB limit")

    # OCR extraction
    raw_text = extract_text(contents, file.content_type)

    # NIM analysis
    sections = await analyze_project(raw_text, file.filename or "project")

    # Create portfolio entry from analysis
    entry_data = PortfolioCreate(
        title=sections["title"],
        summary=sections["summary"] or None,
        impact_statement=sections["impact_statement"] or None,
        technologies=sections["technologies"] or None,
        project_url=sections["project_url"],
    )
    portfolio_response = await create_entry(db, user, entry_data)

    return AnalyzeResponse(
        entry=portfolio_response,
        extracted_text_length=len(raw_text),
        source_filename=file.filename or "unknown",
    )
