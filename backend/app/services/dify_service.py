import json
import httpx
from loguru import logger

from app.core.config import get_settings
from app.services.cache_service import CacheService

settings = get_settings()


class DifyService:
    def __init__(self):
        self.cache = CacheService()

    async def chat(self, tenant_id: int, dataset_id: str | None, query: str, conversation_id: str | None = None):
        cached = self.cache.get_ai_cache(tenant_id, query)
        if cached:
            data = json.loads(cached)
            data["source"] = "cache"
            return data
        headers = {"Authorization": f"Bearer {settings.dify_api_key}", "Content-Type": "application/json"}
        payload = {
            "inputs": {"tenant_id": tenant_id, "dataset_id": dataset_id},
            "query": query,
            "response_mode": "blocking",
            "conversation_id": conversation_id,
            "user": str(tenant_id),
        }
        try:
            async with httpx.AsyncClient(timeout=settings.dify_timeout_seconds) as client:
                response = await client.post(f"{settings.dify_base_url}/chat-messages", headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                result = {
                    "answer": data.get("answer", settings.fallback_answer),
                    "conversation_id": data.get("conversation_id"),
                    "source": "dify",
                }
                self.cache.set_ai_cache(tenant_id, query, result)
                return result
        except Exception as exc:
            logger.exception("Dify chat failed: {}", exc)
            return {"answer": settings.fallback_answer, "conversation_id": conversation_id, "source": "fallback"}
