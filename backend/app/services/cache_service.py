import hashlib
import json
import redis

from app.core.config import get_settings

settings = get_settings()
redis_client = redis.from_url(settings.redis_url, decode_responses=True)


class CacheService:
    def rate_limit(self, key: str, limit: int, ttl: int = 60) -> bool:
        current = redis_client.incr(key)
        if current == 1:
            redis_client.expire(key, ttl)
        return current <= limit

    def get_ai_cache(self, tenant_id: int, query: str):
        hashed = hashlib.sha256(f"{tenant_id}:{query}".encode()).hexdigest()
        return redis_client.get(f"ai_cache:{hashed}")

    def set_ai_cache(self, tenant_id: int, query: str, payload: dict, ttl: int = 600):
        hashed = hashlib.sha256(f"{tenant_id}:{query}".encode()).hexdigest()
        redis_client.setex(f"ai_cache:{hashed}", ttl, json.dumps(payload))
