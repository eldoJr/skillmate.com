import asyncio
import logging
from src.tasks.celery_app import celery

logger = logging.getLogger(__name__)


def _run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


@celery.task
def daily_match_refresh():
    """
    Celery beat task — re-embeds all active users so their match scores
    reflect the latest listing pool. Schedule: once per day.
    """
    async def _inner():
        from sqlalchemy import select
        from src.db.session import AsyncSessionLocal
        from src.models.user import User
        from src.ai.embeddings import embed_user

        async with AsyncSessionLocal() as db:
            users = (await db.scalars(select(User).where(User.is_active == True))).all()
            for user in users:
                try:
                    user.embedding = await embed_user(user)
                except Exception as e:
                    logger.warning("Failed to embed user %s: %s", user.id, e)
            await db.commit()
            logger.info("Daily match refresh complete — %d users re-embedded", len(users))

    _run(_inner())
