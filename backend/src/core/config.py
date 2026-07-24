from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Skillmate"
    VERSION: str = "0.1.0"
    DEBUG: bool = False

    SECRET_KEY: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]
    FRONTEND_URL: str = "http://localhost:5173"

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    REDIS_URL: str = "redis://localhost:6379/0"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM: str = "noreply@skillmate.com"
    EMAILS_FROM_NAME: str = "Skillmate"

    # NVIDIA NIM
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NIM_LLM_MODEL: str = "meta/llama-3.1-70b-instruct"
    NIM_EMBEDDING_MODEL: str = "nvidia/nv-embedqa-e5-v5"
    NIM_EMBEDDING_DIMENSION: int = 1024

    # Meilisearch
    MEILISEARCH_URL: str = "http://localhost:7700"
    MEILISEARCH_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
