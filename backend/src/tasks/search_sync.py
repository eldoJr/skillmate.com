import asyncio
import logging
from src.tasks.celery_app import celery
from src.ai.search import get_meili_client

logger = logging.getLogger(__name__)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


@celery.task(bind=True, max_retries=3, default_retry_delay=15)
def sync_user_to_meili(self, user_id: str):
    async def _inner():
        from src.db.session import AsyncSessionLocal
        from src.models.user import User
        async with AsyncSessionLocal() as db:
            user = await db.get(User, user_id)
            if not user:
                return
            doc = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "headline": user.headline or "",
                "bio": user.bio or "",
                "university": user.university or "",
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
            }
            get_meili_client().index("users").add_documents([doc])
            logger.info("Synced user %s to Meilisearch", user_id)

    try:
        _run(_inner())
    except Exception as exc:
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=15)
def sync_listing_to_meili(self, listing_id: str):
    async def _inner():
        from src.db.session import AsyncSessionLocal
        from src.models.listing import Listing
        async with AsyncSessionLocal() as db:
            listing = await db.get(Listing, listing_id)
            if not listing:
                return
            doc = {
                "id": listing.id,
                "title": listing.title,
                "description": listing.description,
                "category": listing.category,
                "listing_type": listing.listing_type,
                "price": listing.price,
                "is_active": listing.is_active,
                "is_deleted": listing.is_deleted,
                "created_at": listing.created_at.isoformat(),
            }
            get_meili_client().index("listings").add_documents([doc])
            logger.info("Synced listing %s to Meilisearch", listing_id)

    try:
        _run(_inner())
    except Exception as exc:
        raise self.retry(exc=exc)


@celery.task
def sync_all_to_meili():
    """Full re-index — triggered manually or via Celery beat."""
    async def _inner():
        from sqlalchemy import select
        from src.db.session import AsyncSessionLocal
        from src.models.user import User
        from src.models.listing import Listing
        from src.models.skill import Skill

        async with AsyncSessionLocal() as db:
            for user in (await db.scalars(select(User))).all():
                sync_user_to_meili.delay(user.id)
            for listing in (await db.scalars(select(Listing).where(Listing.is_deleted == False))).all():
                sync_listing_to_meili.delay(listing.id)

            skills = (await db.scalars(select(Skill))).all()
            docs = [{"id": s.id, "name": s.name, "category": s.category} for s in skills]
            if docs:
                get_meili_client().index("skills").add_documents(docs)

    _run(_inner())
    logger.info("Queued full Meilisearch re-index")
