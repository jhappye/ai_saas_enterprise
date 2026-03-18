from sqlalchemy import select
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.models import Order, Tenant, User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
def dashboard(user=Depends(require_roles("owner", "admin")), db: Session = Depends(get_db)):
    return {
        "users": [u.email for u in db.scalars(select(User).where(User.tenant_id == user.tenant_id)).all()],
        "tenants": [t.slug for t in db.scalars(select(Tenant)).all()],
        "orders": [o.provider_order_id for o in db.scalars(select(Order).where(Order.tenant_id == user.tenant_id)).all()],
    }
