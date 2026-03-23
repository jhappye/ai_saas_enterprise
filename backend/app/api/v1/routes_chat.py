from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.cache_service import CacheService
from app.services.dify_service import DifyService
from app.services.usage_service import UsageService

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    cache = CacheService()
    allowed = cache.rate_limit(f"rate_limit:{user.tenant_id}:{user.id}", settings.default_rate_limit_per_minute)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
    result = await DifyService().chat(user.tenant_id, user.tenant.dify_dataset_id, payload.query, payload.conversation_id)
    request_id = UsageService(db).log_chat(user.tenant_id, user.id, status=result["source"], metadata={"query": payload.query, "source": result["source"]})
    return ChatResponse(**result, conversation_id=result.get("conversation_id") or request_id)
