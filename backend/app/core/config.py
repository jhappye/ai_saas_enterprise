from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI SaaS Enterprise"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/ai_saas"
    redis_url: str = "redis://redis:6379/0"
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_basic: str = "price_basic"
    stripe_price_pro: str = "price_pro"
    frontend_url: str = "http://localhost:3000"
    dify_base_url: str = "http://host.docker.internal/v1"
    dify_api_key: str = ""
    dify_timeout_seconds: int = 30
    fallback_answer: str = "AI service is temporarily unavailable. Please try again later."
    default_rate_limit_per_minute: int = 60
    uploads_dir: str = "/app/uploads"
    max_upload_size_mb: int = 50
    allowed_upload_extensions: str = "pdf,doc,docx,xls,xlsx,md,txt,csv,ppt,pptx"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("max_upload_size_mb")
    @classmethod
    def validate_upload_size(cls, value: int) -> int:
        if value < 1 or value > 200:
            raise ValueError("MAX_UPLOAD_SIZE_MB must be between 1 and 200")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
