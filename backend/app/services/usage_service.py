import uuid
from sqlalchemy.orm import Session

from app.models.models import UsageLog
from app.repositories.billing_repository import BillingRepository


class UsageService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BillingRepository(db)

    def log_chat(self, tenant_id: int, user_id: int, status: str = "success") -> str:
        request_id = str(uuid.uuid4())
        self.db.add(UsageLog(tenant_id=tenant_id, user_id=user_id, request_id=request_id, status=status))
        self.db.commit()
        return request_id

    def summary(self, tenant_id: int):
        return self.repo.usage_summary(tenant_id)
