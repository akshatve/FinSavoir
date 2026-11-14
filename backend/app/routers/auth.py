from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.config import settings
import random
from app.database import get_db
from app.models.user import User, OTPVerification, PasswordResetToken
from app.schemas.user import EmailRequest, OTPVerifyRequest, UserCreate, UserResponse, Token, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import get_password_hash, verify_password, create_access_token, generate_reset_token, hash_reset_token
from app.core.email import send_otp_email, send_password_reset_email


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/send-otp")
async def send_otp(request: EmailRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    db.query(OTPVerification).filter(OTPVerification.email == request.email).delete()
    new_otp = OTPVerification(email=request.email, otp_code=otp, expires_at=expires_at)
    db.add(new_otp)
    db.commit()

    # Send email in the background so the UI doesn't freeze
    background_tasks.add_task(send_otp_email, request.email, otp)

    return {"message": "OTP sent successfully"}  # <-- Make sure this is indented by 4 spaces only


    

@router.post("/verify-otp")
def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    # 1. Find the OTP record
    record = db.query(OTPVerification).filter(
        OTPVerification.email == request.email,
        OTPVerification.otp_code == request.otp_code
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # 2. Check if expired
    if record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    return {"message": "OTP verified successfully", "verified": True}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Note: In a real app, you'd pass a temporary token from the verify step to prove they verified. 
    # For simplicity, we just check if they exist and create them.
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, is_verified=True)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Clean up the OTP record
    db.query(OTPVerification).filter(OTPVerification.email == user.email).delete()
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}




@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Request a password reset. Always returns success (prevents email enumeration).
    """
    user = db.query(User).filter(User.email == request.email).first()

    if user:
        # Delete any existing unused tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        ).delete()
        db.commit()

        # Generate token + save HASHED version
        raw_token = generate_reset_token()
        token_hash = hash_reset_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        new_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(new_token)
        db.commit()

        # Build reset link — adjust FRONTEND_URL in your .env if needed
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_url}/reset-password?token={raw_token}"

        # Send email in background so request returns fast
        background_tasks.add_task(send_password_reset_email, user.email, reset_link, user.email)

    # Always return the same response regardless of whether the user existed
    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset the password using a valid, unused token.
    """
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    token_hash = hash_reset_token(request.token)

    token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()

    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    if token.used_at is not None:
        raise HTTPException(status_code=400, detail="This reset link has already been used.")

    if token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")

    # Update the user's password
    user = db.query(User).filter(User.id == token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(request.new_password)
    token.used_at = datetime.now(timezone.utc)

    db.commit()

    return {"message": "Password reset successfully. You can now sign in with your new password."}