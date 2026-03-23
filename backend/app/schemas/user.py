from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class TenantSummary(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class UserSummary(BaseModel):
    id: int
    tenant_id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    tenant: TenantSummary

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary
