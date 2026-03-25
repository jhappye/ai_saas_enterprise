from contextlib import asynccontextmanager
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from redis.exceptions import RedisError
from sqlalchemy import text

from app.api.v1.routes_admin import router as admin_router
from app.api.v1.routes_auth import router as auth_router
from app.api.v1.routes_billing import router as billing_router
from app.api.v1.routes_chat import router as chat_router
from app.api.v1.routes_knowledge import router as knowledge_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import Base, SessionLocal, engine
from app.services.cache_service import redis_client

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    start = perf_counter()
    response = await call_next(request)
    elapsed_ms = int((perf_counter() - start) * 1000)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "error": exc.__class__.__name__})


app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(chat_router, prefix=settings.api_v1_prefix)
app.include_router(billing_router, prefix=settings.api_v1_prefix)
app.include_router(knowledge_router, prefix=settings.api_v1_prefix)
app.include_router(admin_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


@app.get("/health/ready")
def readiness():
    db_ok = True
    redis_ok = True

    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    try:
        redis_client.ping()
    except RedisError:
        redis_ok = False

    status = "ok" if db_ok and redis_ok else "degraded"
    return {"status": status, "db": db_ok, "redis": redis_ok}
