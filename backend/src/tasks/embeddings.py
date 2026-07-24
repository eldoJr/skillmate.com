import asyncio
import logging
from src.tasks.celery_app import celery
from src.db.session import AsyncSessionLocal
from src.ai.embeddings import embed_user, embed_listing, embed_portfolio_entry

logger = logging.getLogger(__name__)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def generate_user_embedding(self, user_id: str):
    async def _inner():
        from src.models.user import User
        async with AsyncSessionLocal() as db:
            user = await db.get(User, user_id)
            if not user:
                return
            user.embedding = await embed_user(user)
            await db.commit()
            logger.info("Embedded user %s", user_id)

    try:
        _run(_inner())
    except Exception as exc:
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def generate_listing_embedding(self, listing_id: str):
    async def _inner():
        from src.models.listing import Listing
        async with AsyncSessionLocal() as db:
            listing = await db.get(Listing, listing_id)
            if not listing:
                return
            listing.embedding = await embed_listing(listing)
            await db.commit()
            logger.info("Embedded listing %s", listing_id)

    try:
        _run(_inner())
    except Exception as exc:
        raise self.retry(exc=exc)


@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def generate_portfolio_embedding(self, entry_id: str):
    async def _inner():
        from src.models.portfolio import Portfolio
        async with AsyncSessionLocal() as db:
            entry = await db.get(Portfolio, entry_id)
            if not entry:
                return
            entry.embedding = await embed_portfolio_entry(entry)
            await db.commit()
            logger.info("Embedded portfolio entry %s", entry_id)

    try:
        _run(_inner())
    except Exception as exc:
        raise self.retry(exc=exc)


@celery.task
def reembed_all():
    """Batch re-embedding job — triggered manually or via Celery beat."""
    async def _inner():
        from sqlalchemy import select
        from src.models.user import User
        from src.models.listing import Listing
        from src.models.portfolio import Portfolio

        async with AsyncSessionLocal() as db:
            for user in (await db.scalars(select(User))).all():
                generate_user_embedding.delay(user.id)
            for listing in (await db.scalars(select(Listing).where(Listing.is_deleted == False))).all():
                generate_listing_embedding.delay(listing.id)
            for entry in (await db.scalars(select(Portfolio))).all():
                generate_portfolio_embedding.delay(entry.id)

    _run(_inner())
    logger.info("Queued re-embedding for all records")
