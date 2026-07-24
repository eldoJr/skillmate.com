import uuid
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.user import User
from src.models.listing import Listing
from src.models.proposal import Proposal, ProposalStatus
from src.schemas.proposal import ProposalGenerateRequest, ProposalUpdate, ProposalResponse, ProposalBrief
from src.ai.proposal import generate_proposal


async def generate(
    db: AsyncSession, user: User, req: ProposalGenerateRequest
) -> ProposalResponse:
    listing = await db.get(Listing, req.listing_id)
    if not listing or listing.is_deleted:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot write a proposal for your own listing")

    sections = await generate_proposal(user, listing)

    proposal = Proposal(
        id=str(uuid.uuid4()),
        owner_id=user.id,
        listing_id=req.listing_id,
        status=ProposalStatus.draft,
        **sections,
    )
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)
    return ProposalResponse.model_validate(proposal)


async def get_proposal(db: AsyncSession, user: User, proposal_id: str) -> ProposalResponse:
    proposal = await db.get(Proposal, proposal_id)
    if not proposal or proposal.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return ProposalResponse.model_validate(proposal)


async def list_proposals(db: AsyncSession, user: User) -> list[ProposalBrief]:
    result = await db.scalars(
        select(Proposal)
        .where(Proposal.owner_id == user.id)
        .order_by(Proposal.updated_at.desc())
    )
    return [ProposalBrief.model_validate(p) for p in result.all()]


async def update_proposal(
    db: AsyncSession, user: User, proposal_id: str, data: ProposalUpdate
) -> ProposalResponse:
    proposal = await db.get(Proposal, proposal_id)
    if not proposal or proposal.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status != ProposalStatus.draft:
        raise HTTPException(status_code=400, detail="Only draft proposals can be edited")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(proposal, field, value)

    await db.commit()
    await db.refresh(proposal)
    return ProposalResponse.model_validate(proposal)


async def send_proposal(db: AsyncSession, user: User, proposal_id: str) -> ProposalResponse:
    proposal = await db.get(Proposal, proposal_id)
    if not proposal or proposal.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status != ProposalStatus.draft:
        raise HTTPException(status_code=400, detail="Proposal has already been sent")

    proposal.status = ProposalStatus.sent

    # Notify the listing owner
    from src.services.notifications import create_notification
    from src.websockets.notifications import notification_manager
    from src.schemas.notification import NotificationResponse

    notif = await create_notification(
        db,
        proposal.listing.owner_id,
        "new_proposal",
        f"{user.first_name} sent a proposal for \"{proposal.listing.title}\"",
    )
    await db.commit()
    await db.refresh(proposal)

    await notification_manager.send_to(
        proposal.listing.owner_id,
        {"event": "notification", "data": NotificationResponse.model_validate(notif).model_dump(mode="json")},
    )

    return ProposalResponse.model_validate(proposal)
