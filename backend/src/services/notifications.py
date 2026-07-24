import math
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from src.models.notification import Notification
from src.schemas.notification import NotificationResponse, PaginatedNotifications, UnreadCountResponse


async def create_notification(
    db: AsyncSession,
    user_id: str,
    type: str,
    title: str,
    body: str | None = None,
) -> Notification:
    n = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type=type,
        title=title,
        body=body,
    )
    db.add(n)
    await db.commit()
    await db.refresh(n)
    return n


async def get_notifications(
    db: AsyncSession, user_id: str, page: int, page_size: int
) -> PaginatedNotifications:
    base = select(Notification).where(Notification.user_id == user_id)
    total = await db.scalar(select(func.count()).select_from(base.subquery()))
    result = await db.scalars(
        base.order_by(Notification.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = [NotificationResponse.model_validate(n) for n in result.all()]
    return PaginatedNotifications(
        items=items,
        total=total,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
    )


async def mark_read(db: AsyncSession, user_id: str, notification_id: str) -> None:
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == user_id)
        .values(is_read=True)
    )
    await db.commit()


async def mark_all_read(db: AsyncSession, user_id: str) -> None:
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()


async def get_unread_count(db: AsyncSession, user_id: str) -> UnreadCountResponse:
    count = await db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
    )
    return UnreadCountResponse(unread=count or 0)
