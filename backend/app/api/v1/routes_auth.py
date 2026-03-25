from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.auth import LoginRequest, SignupRequest
from app.schemas.user import AuthResponse, UserSummary
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    result = AuthService(db).signup(payload)
    return AuthResponse(access_token=result["access_token"], user=result["user"])


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    result = AuthService(db).login(payload)
    return AuthResponse(access_token=result["access_token"], user=result["user"])


@router.get("/me", response_model=UserSummary)
def me(user=Depends(get_current_user)):
    return user
