from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"prepared_statement_cache_size": 0},
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,       # Recycle connections every 5 min (Neon drops idle ones)
    pool_pre_ping=True,     # Verify connection is alive before using it
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
