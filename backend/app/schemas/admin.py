from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    active_subscription: str | None = None
    tenant_slug: str
