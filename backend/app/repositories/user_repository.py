from sqlalchemy import select

from app.models.models import Tenant, User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    def get_by_email(self, email: str):
        return self.db.scalar(select(User).where(User.email == email))

    def get_by_id(self, user_id: int):
        return self.db.scalar(select(User).where(User.id == user_id))

    def create_tenant_and_owner(self, *, company_name: str, company_slug: str, full_name: str, email: str, password_hash: str):
        tenant = Tenant(name=company_name, slug=company_slug, status="active", plan="free")
        self.db.add(tenant)
        self.db.flush()
        user = User(tenant_id=tenant.id, full_name=full_name, email=email, password_hash=password_hash, role="owner")
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
