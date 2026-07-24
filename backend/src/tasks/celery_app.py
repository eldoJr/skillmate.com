from celery import Celery
from celery.schedules import crontab
from src.core.config import settings

celery = Celery(
    "skillmate",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "src.tasks.email",
        "src.tasks.embeddings",
        "src.tasks.search_sync",
        "src.tasks.matching",
    ],
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    beat_schedule={
        "daily-match-refresh": {
            "task": "src.tasks.matching.daily_match_refresh",
            "schedule": crontab(hour=3, minute=0),  # 3 AM UTC daily
        },
        "daily-meili-sync": {
            "task": "src.tasks.search_sync.sync_all_to_meili",
            "schedule": crontab(hour=3, minute=30),
        },
    },
)
