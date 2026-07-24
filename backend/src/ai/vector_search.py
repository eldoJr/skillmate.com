from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from pgvector.sqlalchemy import Vector
from src.core.config import settings


async def cosine_search(
    db: AsyncSession,
    table: str,
    embedding: list[float],
    limit: int = 10,
    filters: str = "",
) -> list[dict]:
    """
    Returns rows from `table` ordered by cosine similarity to `embedding`.
    `filters` is an optional raw SQL WHERE clause fragment (e.g. "is_active = true AND is_deleted = false").
    """
    where = f"AND {filters}" if filters else ""
    query = text(f"""
        SELECT id, 1 - (embedding <=> :vec::vector) AS score
        FROM {table}
        WHERE embedding IS NOT NULL {where}
        ORDER BY embedding <=> :vec::vector
        LIMIT :limit
    """)
    result = await db.execute(query, {"vec": str(embedding), "limit": limit})
    return [{"id": row.id, "score": round(float(row.score), 4)} for row in result.fetchall()]
