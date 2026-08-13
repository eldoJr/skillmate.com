from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.certificate import Certificate
from src.models.user import User
from src.schemas.certificate import CertificateCreate, CertificateUpdate, CertificateResponse


async def get_user_certificates(db: AsyncSession, user_id: str) -> list[CertificateResponse]:
    result = await db.execute(
        select(Certificate)
        .where(Certificate.user_id == user_id)
        .order_by(Certificate.issue_date.desc())
    )
    return result.scalars().all()


async def create_certificate(
    db: AsyncSession, user: User, payload: CertificateCreate
) -> Certificate:
    cert = Certificate(
        user_id=user.id,
        title=payload.title,
        issuer=payload.issuer,
        issue_date=payload.issue_date,
        expiry_date=payload.expiry_date,
        credential_id=payload.credential_id,
        credential_url=payload.credential_url,
        description=payload.description,
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


async def update_certificate(
    db: AsyncSession, user: User, cert_id: str, payload: CertificateUpdate
) -> Certificate:
    result = await db.execute(
        select(Certificate).where(Certificate.id == cert_id, Certificate.user_id == user.id)
    )
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cert, field, value)

    await db.commit()
    await db.refresh(cert)
    return cert


async def delete_certificate(db: AsyncSession, user: User, cert_id: str) -> dict:
    result = await db.execute(
        select(Certificate).where(Certificate.id == cert_id, Certificate.user_id == user.id)
    )
    cert = result.scalar_one_or_none()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")

    await db.delete(cert)
    await db.commit()
    return {"message": "Certificate deleted"}
