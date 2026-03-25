from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.common import MessageResponse
from app.schemas.knowledge import KnowledgeDocumentResponse, KnowledgeUploadResponse
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/documents", response_model=list[KnowledgeDocumentResponse])
def list_documents(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return KnowledgeService(db).list_documents(user.tenant_id)


@router.post("/documents", response_model=KnowledgeUploadResponse)
async def upload_document(file: UploadFile = File(...), user=Depends(get_current_user), db: Session = Depends(get_db)):
    document = await KnowledgeService(db).upload_document(
        tenant_id=user.tenant_id,
        user_id=user.id,
        dataset_id=user.tenant.dify_dataset_id,
        file=file,
    )
    return KnowledgeUploadResponse(document=document, message="Document uploaded")


@router.delete("/documents/{document_id}", response_model=MessageResponse)
def delete_document(document_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    KnowledgeService(db).delete_document(user.tenant_id, document_id)
    return MessageResponse(message="Document deleted")
