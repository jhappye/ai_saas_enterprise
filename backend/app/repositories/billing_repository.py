from sqlalchemy import func, select

from app.models.models import Order, Subscription, UsageLog
from app.repositories.base import BaseRepository


class BillingRepository(BaseRepository):
    def create_order(self, **kwargs):
        order = Order(**kwargs)
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def upsert_subscription(self, tenant_id: int, provider_subscription_id: str, plan_code: str, status: str):
        subscription = self.db.scalar(select(Subscription).where(Subscription.tenant_id == tenant_id))
        if not subscription:
            subscription = Subscription(tenant_id=tenant_id, provider_subscription_id=provider_subscription_id, plan_code=plan_code, status=status)
            self.db.add(subscription)
        else:
            subscription.provider_subscription_id = provider_subscription_id
            subscription.plan_code = plan_code
            subscription.status = status
        self.db.commit()
        self.db.refresh(subscription)
        return subscription

    def usage_summary(self, tenant_id: int):
        stmt = select(func.count(UsageLog.id), func.sum(UsageLog.prompt_tokens + UsageLog.completion_tokens)).where(UsageLog.tenant_id == tenant_id)
        count, tokens = self.db.execute(stmt).one()
        return {"requests": count or 0, "tokens": int(tokens or 0)}
