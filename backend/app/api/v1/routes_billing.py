from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.schemas.payment import CheckoutRequest, CheckoutResponse
from app.services.payment_service import PaymentService
from app.services.usage_service import UsageService

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(payload: CheckoutRequest, user=Depends(require_roles("owner", "admin")), db: Session = Depends(get_db)):
    url = PaymentService(db).create_checkout(user, payload.plan_code)
    return CheckoutResponse(checkout_url=url)


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(alias="Stripe-Signature"), db: Session = Depends(get_db)):
    payload = await request.body()
    event_type = PaymentService(db).handle_webhook(payload, stripe_signature)
    return {"received": True, "event_type": event_type}


@router.get("/usage")
def usage(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return UsageService(db).summary(user.tenant_id)
