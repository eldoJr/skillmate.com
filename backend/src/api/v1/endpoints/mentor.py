from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user, require_ai
from src.db.session import get_db
from src.models.user import User
from src.schemas.mentor import ChatRequest, ConversationResponse, ConversationBrief, ProactiveSuggestion
import src.services.mentor as svc

router = APIRouter()


@router.post("/chat", dependencies=[Depends(require_ai)])
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return StreamingResponse(
        svc.stream_chat(db, current_user, req),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/conversations", response_model=list[ConversationBrief])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_conversations(db, current_user)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_conversation(db, current_user, conversation_id)


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await svc.delete_conversation(db, current_user, conversation_id)


@router.get("/proactive", response_model=list[ProactiveSuggestion])
async def proactive_suggestions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_proactive_suggestions(db, current_user)
