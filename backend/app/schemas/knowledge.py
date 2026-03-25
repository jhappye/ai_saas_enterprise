from datetime import datetime

from pydantic import BaseModel


class KnowledgeDocumentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    content_type: str | None = None
    status: str
    created_at: datetime


class KnowledgeUploadResponse(BaseModel):
    document: KnowledgeDocumentResponse
    message: str
