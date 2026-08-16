import secrets
from datetime import datetime, timedelta, timezone
import uuid
from argon2 import PasswordHasher
import jwt
import hashlib
from app.core.config import settings


password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        password_hasher.verify(password_hash, password)
        return True
    except Exception:
        return False


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    return password_hasher.hash(otp)


def verify_otp(otp: str, otp_hash: str) -> bool:
    try:
        password_hasher.verify(otp_hash, otp)
        return True
    except Exception:
        return False


def get_otp_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=10)

def create_access_token(user_id: str) -> str:

    now = datetime.now(timezone.utc)

    expire = now + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )

    payload = {
        "sub": user_id,
        "iat": now,
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return token

def create_refresh_token(user_id: str) -> tuple[str, str]:

    now = datetime.now(timezone.utc)

    expire = now + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )

    token_id = str(uuid.uuid4())

    payload = {
        "sub": user_id,
        "jti": token_id,
        "type": "refresh",
        "iat": now,
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return token, token_id

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(
        token.encode()
    ).hexdigest()