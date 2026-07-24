from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user
from src.core.security import decode_token
from src.db.session import get_db, AsyncSessionLocal
from src.models.user import User
from src.schemas.message import SendMessage, MessageResponse, ConversationSummary, UnreadCountResponse
from src.websockets.chat import manager
import src.services.messages as svc

router = APIRouter()


@router.post("/", response_model=MessageResponse, status_code=201)
async def send_message(
    data: SendMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg = await svc.send_message(db, current_user, data)
    await manager.send_to(data.receiver_id, {"event": "new_message", "data": msg.model_dump(mode="json")})
    return msg


@router.get("/conversations", response_model=list[ConversationSummary])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_conversations(db, current_user)


@router.get("/thread/{partner_id}", response_model=list[MessageResponse])
async def get_thread(
    partner_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_thread(db, current_user, partner_id, page, page_size)


@router.post("/thread/{partner_id}/read", status_code=204)
async def mark_read(
    partner_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await svc.mark_thread_read(db, current_user, partner_id)


@router.get("/unread", response_model=UnreadCountResponse)
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_unread_count(db, current_user)


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket, token: str):
    payload = decode_token(token, token_type="access")
    if not payload:
        await ws.close(code=4001)
        return

    user_id: str = payload.get("sub")
    if not user_id:
        await ws.close(code=4001)
        return

    await manager.connect(user_id, ws)
    try:
        while True:
            await ws.receive_text()  # keep connection alive; sending is server-initiated
    except WebSocketDisconnect:
        manager.disconnect(user_id, ws)
