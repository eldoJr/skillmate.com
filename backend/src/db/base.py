from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so Alembic detects them
from src.models import user, listing, skill, message, review, notification, portfolio  # noqa
