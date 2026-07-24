from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user
from src.core.security import decode_token
from src.db.session import get_db
from src.models.user import User
from src.schemas.notification import PaginatedNotifications, UnreadCountResponse
from src.websockets.notifications import notification_manager
import src.services.notifications as svc

router = APIRouter()


@router.get("/", response_model=PaginatedNotifications)
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_notifications(db, current_user.id, page, page_size)


@router.post("/{notification_id}/read", status_code=204)
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await svc.mark_read(db, current_user.id, notification_id)


@router.post("/read-all", status_code=204)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await svc.mark_all_read(db, current_user.id)


@router.get("/unread", response_model=UnreadCountResponse)
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_unread_count(db, current_user.id)


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

    await notification_manager.connect(user_id, ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        notification_manager.disconnect(user_id, ws)
