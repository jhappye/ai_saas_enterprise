from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    total_documents: int
    total_chats: int
    avg_response_ms: int
    active_subscription: str | None = None
    tenant_slug: str
