import meilisearch
from src.core.config import settings

_client: meilisearch.Client | None = None

INDEXES = {
    "users": {
        "primaryKey": "id",
        "searchableAttributes": ["first_name", "last_name", "headline", "bio", "university"],
        "filterableAttributes": ["university", "is_active"],
        "sortableAttributes": ["created_at"],
    },
    "listings": {
        "primaryKey": "id",
        "searchableAttributes": ["title", "description", "category"],
        "filterableAttributes": ["category", "listing_type", "is_active", "is_deleted"],
        "sortableAttributes": ["created_at", "price"],
    },
    "skills": {
        "primaryKey": "id",
        "searchableAttributes": ["name", "category"],
        "filterableAttributes": ["category"],
        "sortableAttributes": [],
    },
}


def get_meili_client() -> meilisearch.Client | None:
    global _client
    if not settings.MEILISEARCH_URL or not settings.MEILISEARCH_API_KEY:
        return None
    if _client is None:
        try:
            _client = meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_API_KEY)
        except Exception:
            return None
    return _client


def setup_indexes() -> None:
    client = get_meili_client()
    if client is None:
        return
    for index_name, config in INDEXES.items():
        try:
            client.create_index(index_name, {"primaryKey": config["primaryKey"]})
            index = client.index(index_name)
            index.update_searchable_attributes(config["searchableAttributes"])
            index.update_filterable_attributes(config["filterableAttributes"])
            if config["sortableAttributes"]:
                index.update_sortable_attributes(config["sortableAttributes"])
        except Exception:
            pass


def search(index_name: str, query: str, filters: str = "", limit: int = 20) -> dict:
    client = get_meili_client()
    if client is None:
        return {"hits": [], "estimatedTotalHits": 0}
    try:
        params: dict = {"limit": limit}
        if filters:
            params["filter"] = filters
        return client.index(index_name).search(query, params)
    except Exception:
        return {"hits": [], "estimatedTotalHits": 0}
