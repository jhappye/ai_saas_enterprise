from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.models.models import Tenant, User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    def get_by_email(self, email: str):
        stmt = select(User).options(joinedload(User.tenant)).where(User.email == email)
        return self.db.scalar(stmt)

    def get_by_id(self, user_id: int):
        stmt = select(User).options(joinedload(User.tenant)).where(User.id == user_id)
        return self.db.scalar(stmt)

    def get_tenant_by_slug(self, slug: str):
        return self.db.scalar(select(Tenant).where(Tenant.slug == slug))

    def create_tenant_and_owner(self, *, company_name: str, company_slug: str, full_name: str, email: str, password_hash: str):
        tenant = Tenant(name=company_name, slug=company_slug, status="active", plan="free")
        self.db.add(tenant)
        self.db.flush()
        user = User(tenant_id=tenant.id, full_name=full_name, email=email, password_hash=password_hash, role="owner")
        self.db.add(user)
        self.db.commit()
        return self.get_by_id(user.id)
