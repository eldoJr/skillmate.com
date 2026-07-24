from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user
from src.db.session import get_db
from src.models.user import User
from src.schemas.portfolio import PortfolioCreate, PortfolioUpdate, PortfolioResponse, ImageResponse, AnalyzeResponse
import src.services.portfolio as svc

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse, status_code=201)
async def analyze_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.analyze_file(db, current_user, file)


@router.post("/", response_model=PortfolioResponse, status_code=201)
async def create_entry(
    data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.create_entry(db, current_user, data)


@router.get("/user/{user_id}", response_model=list[PortfolioResponse])
async def list_entries(user_id: str, db: AsyncSession = Depends(get_db)):
    return await svc.get_entries(db, user_id)


@router.get("/{entry_id}", response_model=PortfolioResponse)
async def get_entry(entry_id: str, db: AsyncSession = Depends(get_db)):
    return await svc.get_entry(db, entry_id)


@router.patch("/{entry_id}", response_model=PortfolioResponse)
async def update_entry(
    entry_id: str,
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.update_entry(db, current_user, entry_id, data)


@router.delete("/{entry_id}", status_code=204)
async def delete_entry(
    entry_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await svc.delete_entry(db, current_user, entry_id)


@router.post("/{entry_id}/image", response_model=ImageResponse)
async def upload_image(
    entry_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.upload_image(db, current_user, entry_id, file)
