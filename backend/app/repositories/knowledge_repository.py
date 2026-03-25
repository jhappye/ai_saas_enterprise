from sqlalchemy import select

from app.models.models import KnowledgeDocument
from app.repositories.base import BaseRepository


class KnowledgeRepository(BaseRepository):
    def create_document(self, **kwargs):
        document = KnowledgeDocument(**kwargs)
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def list_documents(self, tenant_id: int):
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.tenant_id == tenant_id).order_by(KnowledgeDocument.created_at.desc())
        return self.db.scalars(stmt).all()

    def get_document(self, tenant_id: int, document_id: int):
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.tenant_id == tenant_id, KnowledgeDocument.id == document_id)
        return self.db.scalar(stmt)

    def delete_document(self, document: KnowledgeDocument):
        self.db.delete(document)
        self.db.commit()
