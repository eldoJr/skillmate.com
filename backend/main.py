import logging
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from src.core.config import settings
from src.api.v1.router import api_router
from src.db.session import engine
from src.db.base import Base

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS must be added BEFORE the error-catching middleware so it always runs
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error("Unhandled exception on %s:\n%s", request.url, traceback.format_exc())
            return JSONResponse(status_code=500, content={"detail": str(exc)})


app.add_middleware(CatchAllMiddleware)

# Serve uploaded media files
Path("media").mkdir(exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(api_router, prefix="/api/v1")
