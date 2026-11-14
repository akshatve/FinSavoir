from pydantic import BaseModel, EmailStr
from datetime import datetime

class EmailRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    is_verified: bool
    created_at: datetime
    class Config:
        from_attributes = True


class NewsletterSubscribe(BaseModel):
    email: EmailStr



class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str




# ===== ADD THESE =====

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str