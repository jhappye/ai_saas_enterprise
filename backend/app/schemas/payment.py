from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    plan_code: str


class CheckoutResponse(BaseModel):
    checkout_url: str
