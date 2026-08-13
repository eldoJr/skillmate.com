from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.core.deps import get_current_user
from src.models.user import User
from src.schemas.certificate import CertificateCreate, CertificateUpdate, CertificateResponse
import src.services.certificates as certificates_service

router = APIRouter()


@router.get("/", response_model=list[CertificateResponse])
async def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await certificates_service.get_user_certificates(db, current_user.id)


@router.get("/user/{user_id}", response_model=list[CertificateResponse])
async def get_user_certificates(user_id: str, db: AsyncSession = Depends(get_db)):
    return await certificates_service.get_user_certificates(db, user_id)


@router.post("/", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    payload: CertificateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await certificates_service.create_certificate(db, current_user, payload)


@router.patch("/{cert_id}", response_model=CertificateResponse)
async def update_certificate(
    cert_id: str,
    payload: CertificateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await certificates_service.update_certificate(db, current_user, cert_id, payload)


@router.delete("/{cert_id}", status_code=status.HTTP_200_OK)
async def delete_certificate(
    cert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await certificates_service.delete_certificate(db, current_user, cert_id)
