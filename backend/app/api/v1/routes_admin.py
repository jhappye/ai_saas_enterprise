from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.schemas.admin import DashboardMetrics
from app.services.usage_service import UsageService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardMetrics)
def dashboard(user=Depends(require_roles("owner", "admin")), db: Session = Depends(get_db)):
    return UsageService(db).dashboard(user.tenant_id, user.tenant.slug)
