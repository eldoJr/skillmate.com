from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.deps import get_current_user, require_ai
from src.db.session import get_db
from src.models.user import User
from src.schemas.proposal import ProposalGenerateRequest, ProposalUpdate, ProposalResponse, ProposalBrief
import src.services.proposal as svc

router = APIRouter()


@router.post("/generate", response_model=ProposalResponse, status_code=201, dependencies=[Depends(require_ai)])
async def generate(
    req: ProposalGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.generate(db, current_user, req)


@router.get("/", response_model=list[ProposalBrief])
async def list_proposals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.list_proposals(db, current_user)


@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.get_proposal(db, current_user, proposal_id)


@router.patch("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    proposal_id: str,
    data: ProposalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.update_proposal(db, current_user, proposal_id, data)


@router.post("/{proposal_id}/send", response_model=ProposalResponse)
async def send_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await svc.send_proposal(db, current_user, proposal_id)
