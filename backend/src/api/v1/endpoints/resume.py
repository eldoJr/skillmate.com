from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user, require_ai
from src.db.session import get_db
from src.models.user import User
import src.services.resume as svc

router = APIRouter()


@router.get("/pdf", dependencies=[Depends(require_ai)])
async def download_pdf(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    return await svc.generate_pdf(db, current_user)


@router.get("/docx", dependencies=[Depends(require_ai)])
async def download_docx(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    return await svc.generate_docx(db, current_user)
