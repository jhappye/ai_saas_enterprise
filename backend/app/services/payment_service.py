import stripe
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.models import User
from app.repositories.billing_repository import BillingRepository

settings = get_settings()
stripe.api_key = settings.stripe_secret_key


class PaymentService:
    def __init__(self, db: Session):
        self.repo = BillingRepository(db)

    def create_checkout(self, user: User, plan_code: str):
        price_map = {"basic": settings.stripe_price_basic, "pro": settings.stripe_price_pro}
        price_id = price_map.get(plan_code)
        if not price_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported plan")
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            customer_email=user.email,
            success_url=f"{settings.frontend_url}/app/billing?success=1",
            cancel_url=f"{settings.frontend_url}/pricing?canceled=1",
            metadata={"tenant_id": user.tenant_id, "user_id": user.id, "plan_code": plan_code},
        )
        self.repo.create_order(
            tenant_id=user.tenant_id,
            user_id=user.id,
            provider="stripe",
            provider_order_id=session.id,
            amount=0,
            currency="usd",
            status="pending",
        )
        return session.url

    def handle_webhook(self, payload: bytes, signature: str):
        event = stripe.Webhook.construct_event(payload=payload, sig_header=signature, secret=settings.stripe_webhook_secret)
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            meta = session.get("metadata", {})
            self.repo.upsert_subscription(
                tenant_id=int(meta["tenant_id"]),
                provider_subscription_id=session.get("subscription"),
                plan_code=meta.get("plan_code", "basic"),
                status="active",
            )
        return event["type"]
