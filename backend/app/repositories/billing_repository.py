from sqlalchemy import func, select

from app.models.models import KnowledgeDocument, Order, Subscription, UsageLog, User
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

    def dashboard_summary(self, tenant_id: int):
        total_users = self.db.scalar(select(func.count()).select_from(User).where(User.tenant_id == tenant_id))
        total_orders = self.db.scalar(select(func.count()).select_from(Order).where(Order.tenant_id == tenant_id))
        total_documents = self.db.scalar(select(func.count()).select_from(KnowledgeDocument).where(KnowledgeDocument.tenant_id == tenant_id))
        total_chats = self.db.scalar(select(func.count()).select_from(UsageLog).where(UsageLog.tenant_id == tenant_id, UsageLog.feature == "chat"))
        revenue = self.db.scalar(select(func.coalesce(func.sum(Order.amount), 0)).where(Order.tenant_id == tenant_id, Order.status.in_(["paid", "active", "pending"])))
        subscription = self.db.scalar(select(Subscription).where(Subscription.tenant_id == tenant_id))
        return {
            "total_users": int(total_users or 0),
            "total_orders": int(total_orders or 0),
            "total_revenue": float(revenue or 0),
            "total_documents": int(total_documents or 0),
            "total_chats": int(total_chats or 0),
            "avg_response_ms": 0,
            "active_subscription": subscription.plan_code if subscription and subscription.status == "active" else None,
        }
