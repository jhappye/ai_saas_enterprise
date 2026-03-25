import json
import uuid
from sqlalchemy.orm import Session

from app.models.models import UsageLog
from app.repositories.billing_repository import BillingRepository


class UsageService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BillingRepository(db)

    def log_chat(
        self,
        tenant_id: int,
        user_id: int,
        status: str = "success",
        metadata: dict | None = None,
        response_ms: int | None = None,
    ) -> str:
        request_id = str(uuid.uuid4())
        payload = metadata or {}
        if response_ms is not None:
            payload["response_ms"] = response_ms

        self.db.add(
            UsageLog(
                tenant_id=tenant_id,
                user_id=user_id,
                request_id=request_id,
                feature="chat",
                status=status,
                metadata_json=json.dumps(payload),
            )
        )
        self.db.commit()
        return request_id

    def summary(self, tenant_id: int):
        return self.repo.usage_summary(tenant_id)

    def dashboard(self, tenant_id: int, tenant_slug: str):
        return {**self.repo.dashboard_summary(tenant_id), "tenant_slug": tenant_slug}
