from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=255)
    company_slug: str = Field(min_length=2, max_length=100, pattern=r'^[a-z0-9-]+$')
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
