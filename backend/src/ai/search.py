import meilisearch
from src.core.config import settings

_client: meilisearch.Client | None = None


def get_meili_client() -> meilisearch.Client:
    global _client
    if _client is None:
        _client = meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_API_KEY)
    return _client


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


def setup_indexes() -> None:
    """Create indexes and configure attributes. Safe to call on startup."""
    client = get_meili_client()
    for index_name, config in INDEXES.items():
        client.create_index(index_name, {"primaryKey": config["primaryKey"]})
        index = client.index(index_name)
        index.update_searchable_attributes(config["searchableAttributes"])
        index.update_filterable_attributes(config["filterableAttributes"])
        if config["sortableAttributes"]:
            index.update_sortable_attributes(config["sortableAttributes"])


def search(index_name: str, query: str, filters: str = "", limit: int = 20) -> dict:
    client = get_meili_client()
    params = {"limit": limit}
    if filters:
        params["filter"] = filters
    return client.index(index_name).search(query, params)
