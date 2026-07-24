import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, update
from src.models.message import Message
from src.models.user import User
from src.schemas.message import SendMessage, MessageResponse, ConversationSummary, UnreadCountResponse


async def send_message(db: AsyncSession, sender: User, data: SendMessage) -> MessageResponse:
    if sender.id == data.receiver_id:
        raise HTTPException(status_code=400, detail="Cannot send a message to yourself")

    receiver = await db.get(User, data.receiver_id)
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    msg = Message(
        id=str(uuid.uuid4()),
        sender_id=sender.id,
        receiver_id=data.receiver_id,
        content=data.content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    from src.services.notifications import create_notification
    from src.websockets.notifications import notification_manager
    notif = await create_notification(
        db, data.receiver_id, "new_message",
        f"New message from {sender.first_name}",
        msg.content[:100],
    )
    from src.schemas.notification import NotificationResponse
    await notification_manager.send_to(
        data.receiver_id,
        {"event": "notification", "data": NotificationResponse.model_validate(notif).model_dump(mode="json")},
    )

    return MessageResponse.model_validate(msg)


async def get_thread(
    db: AsyncSession, current_user: User, partner_id: str, page: int, page_size: int
) -> list[MessageResponse]:
    result = await db.scalars(
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return [MessageResponse.model_validate(m) for m in result.all()]


async def get_conversations(db: AsyncSession, current_user: User) -> list[ConversationSummary]:
    # Get distinct partners
    sent = select(Message.receiver_id.label("partner_id")).where(Message.sender_id == current_user.id)
    received = select(Message.sender_id.label("partner_id")).where(Message.receiver_id == current_user.id)
    partner_ids_result = await db.scalars(sent.union(received))
    partner_ids = list(set(partner_ids_result.all()))

    conversations = []
    for pid in partner_ids:
        partner = await db.get(User, pid)
        if not partner:
            continue

        last_msg = await db.scalar(
            select(Message)
            .where(
                or_(
                    and_(Message.sender_id == current_user.id, Message.receiver_id == pid),
                    and_(Message.sender_id == pid, Message.receiver_id == current_user.id),
                )
            )
            .order_by(Message.created_at.desc())
            .limit(1)
        )

        unread = await db.scalar(
            select(func.count(Message.id)).where(
                Message.sender_id == pid,
                Message.receiver_id == current_user.id,
                Message.is_read == False,
            )
        )

        from src.schemas.message import UserBrief
        conversations.append(
            ConversationSummary(
                partner=UserBrief.model_validate(partner),
                last_message=last_msg.content,
                last_message_at=last_msg.created_at,
                unread_count=unread or 0,
            )
        )

    conversations.sort(key=lambda c: c.last_message_at, reverse=True)
    return conversations


async def mark_thread_read(db: AsyncSession, current_user: User, partner_id: str) -> None:
    await db.execute(
        update(Message)
        .where(
            Message.sender_id == partner_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False,
        )
        .values(is_read=True)
    )
    await db.commit()


async def get_unread_count(db: AsyncSession, current_user: User) -> UnreadCountResponse:
    count = await db.scalar(
        select(func.count(Message.id)).where(
            Message.receiver_id == current_user.id,
            Message.is_read == False,
        )
    )
    return UnreadCountResponse(unread=count or 0)
