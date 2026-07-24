from src.ai.search import search as meili_search, get_meili_client
from src.schemas.search import SearchHit, SearchResponse, MultiSearchResponse, SuggestResponse


def _listing_hit(doc: dict) -> SearchHit:
    return SearchHit(
        id=doc["id"],
        type="listing",
        title=doc.get("title", ""),
        subtitle=doc.get("category", ""),
        data=doc,
    )


def _user_hit(doc: dict) -> SearchHit:
    first = doc.get("first_name", "")
    last = doc.get("last_name", "")
    return SearchHit(
        id=doc["id"],
        type="user",
        title=f"{first} {last}".strip(),
        subtitle=doc.get("university", ""),
        data=doc,
    )


def _skill_hit(doc: dict) -> SearchHit:
    return SearchHit(
        id=doc["id"],
        type="skill",
        title=doc.get("name", ""),
        subtitle=doc.get("category", ""),
        data=doc,
    )


def _build_listing_filter(
    category: str | None,
    listing_type: str | None,
) -> str:
    parts = ["is_active = true", "is_deleted = false"]
    if category:
        parts.append(f'category = "{category}"')
    if listing_type:
        parts.append(f'listing_type = "{listing_type}"')
    return " AND ".join(parts)


async def search_listings(
    query: str,
    limit: int = 20,
    category: str | None = None,
    listing_type: str | None = None,
) -> SearchResponse:
    filters = _build_listing_filter(category, listing_type)
    result = meili_search("listings", query, filters=filters, limit=limit)
    hits = [_listing_hit(h) for h in result.get("hits", [])]
    return SearchResponse(
        query=query,
        hits=hits,
        total=result.get("estimatedTotalHits", len(hits)),
        index="listings",
    )


async def search_users(
    query: str,
    limit: int = 20,
    university: str | None = None,
) -> SearchResponse:
    filters = "is_active = true"
    if university:
        filters += f' AND university = "{university}"'
    result = meili_search("users", query, filters=filters, limit=limit)
    hits = [_user_hit(h) for h in result.get("hits", [])]
    return SearchResponse(
        query=query,
        hits=hits,
        total=result.get("estimatedTotalHits", len(hits)),
        index="users",
    )


async def search_skills(query: str, limit: int = 20) -> SearchResponse:
    result = meili_search("skills", query, limit=limit)
    hits = [_skill_hit(h) for h in result.get("hits", [])]
    return SearchResponse(
        query=query,
        hits=hits,
        total=result.get("estimatedTotalHits", len(hits)),
        index="skills",
    )


async def multi_search(
    query: str,
    limit: int = 5,
) -> MultiSearchResponse:
    listings = await search_listings(query, limit=limit)
    users = await search_users(query, limit=limit)
    skills = await search_skills(query, limit=limit)
    return MultiSearchResponse(
        query=query,
        listings=listings,
        users=users,
        skills=skills,
        total=listings.total + users.total + skills.total,
    )


async def suggest(query: str, limit: int = 8) -> SuggestResponse:
    """
    Autocomplete suggestions — pull top listing titles + skill names
    that match the query prefix.
    """
    client = get_meili_client()
    suggestions: list[str] = []

    for index_name, field in [("listings", "title"), ("skills", "name")]:
        try:
            result = client.index(index_name).search(query, {"limit": limit // 2, "attributesToRetrieve": [field]})
            for hit in result.get("hits", []):
                val = hit.get(field, "")
                if val and val not in suggestions:
                    suggestions.append(val)
        except Exception:
            pass

    return SuggestResponse(query=query, suggestions=suggestions[:limit])
