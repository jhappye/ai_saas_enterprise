import re
import uuid
from pathlib import Path

import httpx
from fastapi import HTTPException, UploadFile, status
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.repositories.knowledge_repository import KnowledgeRepository

settings = get_settings()


class KnowledgeService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = KnowledgeRepository(db)

    async def upload_document(self, *, tenant_id: int, user_id: int, dataset_id: str | None, file: UploadFile):
        if not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is required")

        ext = Path(file.filename).suffix.lower().lstrip(".")
        allowed_exts = {item.strip().lower() for item in settings.allowed_upload_extensions.split(",") if item.strip()}
        if ext not in allowed_exts:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported file type: .{ext}")

        content = await file.read()
        size_limit = settings.max_upload_size_mb * 1024 * 1024
        if len(content) > size_limit:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File too large. Max {settings.max_upload_size_mb}MB")

        tenant_dir = Path(settings.uploads_dir) / str(tenant_id)
        tenant_dir.mkdir(parents=True, exist_ok=True)

        safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", file.filename)
        target_name = f"{uuid.uuid4()}_{safe_name}"
        target_path = tenant_dir / target_name
        target_path.write_bytes(content)

        dify_document_id = None
        status_label = "uploaded"

        if dataset_id and settings.dify_api_key:
            try:
                async with httpx.AsyncClient(timeout=settings.dify_timeout_seconds) as client:
                    response = await client.post(
                        f"{settings.dify_base_url}/datasets/{dataset_id}/document/create-by-file",
                        headers={"Authorization": f"Bearer {settings.dify_api_key}"},
                        files={"file": (safe_name, content, file.content_type or "application/octet-stream")},
                        data={"indexing_technique": "high_quality", "process_rule": "automatic"},
                    )
                    response.raise_for_status()
                    payload = response.json()
                    dify_document_id = payload.get("document", {}).get("id") or payload.get("id")
                    status_label = "processing"
            except Exception as exc:
                logger.warning("Dify document upload failed for tenant {}: {}", tenant_id, exc)
                status_label = "uploaded"

        document = self.repo.create_document(
            tenant_id=tenant_id,
            user_id=user_id,
            filename=safe_name,
            file_size=len(content),
            content_type=file.content_type,
            storage_path=str(target_path),
            dify_document_id=dify_document_id,
            status=status_label,
        )
        return document

    def list_documents(self, tenant_id: int):
        return self.repo.list_documents(tenant_id)

    def delete_document(self, tenant_id: int, document_id: int):
        document = self.repo.get_document(tenant_id, document_id)
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        try:
            Path(document.storage_path).unlink(missing_ok=True)
        except Exception:
            pass
        self.repo.delete_document(document)
