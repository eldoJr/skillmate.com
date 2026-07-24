from src.models.user import User
from src.models.listing import Listing
from src.models.portfolio import Portfolio
from src.ai.nim_client import embed_text


def _user_text(user: User) -> str:
    parts = [
        f"{user.first_name} {user.last_name}",
        user.headline or "",
        user.bio or "",
        user.university or "",
        user.role or "",
        " ".join(s.name for s in (user.skills or [])),
    ]
    return " ".join(p for p in parts if p).strip()


def _listing_text(listing: Listing) -> str:
    parts = [
        listing.title,
        listing.description,
        listing.category,
        " ".join(s.name for s in (listing.skills or [])),
    ]
    return " ".join(p for p in parts if p).strip()


def _portfolio_text(entry: Portfolio) -> str:
    import json
    techs = ""
    if entry.technologies:
        try:
            techs = " ".join(json.loads(entry.technologies))
        except ValueError:
            pass
    parts = [entry.title, entry.summary or "", entry.impact_statement or "", techs]
    return " ".join(p for p in parts if p).strip()


async def embed_user(user: User) -> list[float]:
    return await embed_text(_user_text(user))


async def embed_listing(listing: Listing) -> list[float]:
    return await embed_text(_listing_text(listing))


async def embed_portfolio_entry(entry: Portfolio) -> list[float]:
    return await embed_text(_portfolio_text(entry))
