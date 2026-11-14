from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import secrets
import hashlib
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


# ===== ADD THESE =====

def generate_reset_token() -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(32)  # 43 chars, ~256 bits of entropy


def hash_reset_token(raw_token: str) -> str:
    """Hash the raw token with SHA-256 before storing it in the DB."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()