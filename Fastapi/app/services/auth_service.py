from fastapi import HTTPException, status
from app.services.email_service import send_otp_email
from app.database.mongodb import users_collection
from app.database.mongodb import refresh_tokens_collection
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import (
    RegisterRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest,
)
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.security import (
    generate_otp,
    get_otp_expiry,
    hash_otp,
    hash_password,
    verify_otp,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)
from datetime import datetime, timezone
from app.core.security import verify_otp


def register_user(data: RegisterRequest) -> User:
    # Check whether username already exists
    existing_username = users_collection.find_one(
        {"username": data.username}
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    # Check whether email already exists
    existing_email = users_collection.find_one(
        {"email": str(data.email)}
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    # Hash password
    password_hash = hash_password(data.password)

    # Generate OTP
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    otp_expires_at = get_otp_expiry()
    now = datetime.now(timezone.utc)

    # Create user object
    user = User(
        username=data.username,
        email=str(data.email),
        password_hash=password_hash,
        otp_hash=otp_hash,
        otp_expires_at=otp_expires_at,
        otp_sent_at=now,
    )

    # Convert Pydantic model to dictionary
    user_document = user.model_dump()

    # Insert into MongoDB
    users_collection.insert_one(user_document)

    # For development only — later we'll email this OTP
    #print(f"OTP for {user.email}: {otp}")
    send_otp_email(
    recipient=user.email,
    otp=otp)

    return user
def verify_user_otp(data: VerifyOTPRequest) -> None:

    user = users_collection.find_one(
        {"email": str(data.email)}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is already verified",
        )

    if not user.get("otp_hash") or not user.get("otp_expires_at"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP. Please request a new OTP.",
        )

    # Check whether OTP has expired
    now = datetime.now(timezone.utc)

    otp_expires_at = user["otp_expires_at"]

    # Handle MongoDB naive datetime
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(
            tzinfo=timezone.utc
        )

    if otp_expires_at < now:

        # Invalidate expired OTP
        users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$unset": {
                    "otp_hash": "",
                    "otp_expires_at": "",
                },
                "$set": {
                    "otp_failed_attempts": 0,
                    "updated_at": now,
                },
            },
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new OTP.",
        )

    # Check maximum failed attempts
    failed_attempts = user.get(
        "otp_failed_attempts",
        0
    )

    if failed_attempts >= 5:

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Please request a new OTP.",
        )

    # Verify OTP
    if not verify_otp(
        data.otp,
        user["otp_hash"]
    ):

        new_attempt_count = failed_attempts + 1

        if new_attempt_count >= 5:

            # Invalidate the current OTP
            users_collection.update_one(
                {"_id": user["_id"]},
                {
                    "$unset": {
                        "otp_hash": "",
                        "otp_expires_at": "",
                    },
                    "$set": {
                        "otp_failed_attempts": new_attempt_count,
                        "updated_at": now,
                    },
                },
            )

            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect attempts. Please request a new OTP.",
            )

        # Just increment failed attempts
        users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "otp_failed_attempts": new_attempt_count,
                    "updated_at": now,
                },
            },
        )

        remaining_attempts = 5 - new_attempt_count

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid OTP. "
                f"{remaining_attempts} attempts remaining."
            ),
        )

    # OTP is correct
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "is_verified": True,
                "updated_at": now,
            },
            "$unset": {
                "otp_hash": "",
                "otp_expires_at": "",
                "otp_failed_attempts": 0,
                "otp_sent_at": "",
            },
        },
    )
def resend_otp(data: ResendOTPRequest) -> None:

    user = users_collection.find_one(
        {"email": str(data.email)}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is already verified",
        )

    now = datetime.now(timezone.utc)

    # Check OTP resend cooldown
    if user.get("otp_sent_at"):

        otp_sent_at = user["otp_sent_at"]

        # MongoDB may return a naive datetime
        if otp_sent_at.tzinfo is None:
            otp_sent_at = otp_sent_at.replace(
                tzinfo=timezone.utc
            )

        elapsed = (now - otp_sent_at).total_seconds()

        if elapsed < 60:
            remaining = int(60 - elapsed)

            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another OTP.",
            )

    # Generate a new OTP
    otp = generate_otp()

    # Hash the new OTP
    otp_hash = hash_otp(otp)

    # Generate new expiry time
    otp_expires_at = get_otp_expiry()

    # Update the user's OTP information
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "otp_hash": otp_hash,
                "otp_expires_at": otp_expires_at,
                "otp_sent_at": now,
                "otp_failed_attempts": 0,
                "updated_at": now,
            }
        },
    )

    # Send the new OTP
    send_otp_email(
        recipient=user["email"],
        otp=otp,
    )

def login_user(data: LoginRequest) -> dict:

    user = users_collection.find_one(
        {"email": str(data.email)}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in",
        )

    if not verify_password(
        data.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create access token
    access_token = create_access_token(
        user_id=user["user_id"]
    )

    # Create refresh token
    refresh_token, token_id = create_refresh_token(
        user_id=user["user_id"]
    )

    # Hash refresh token before storing
    refresh_token_hash = hash_refresh_token(
        refresh_token
    )

    # Create database document
    refresh_token_document = RefreshToken(
        token_id=token_id,
        user_id=user["user_id"],
        token_hash=refresh_token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(
            days=settings.jwt_refresh_token_expire_days
        ),
    )

    # Store refresh token information
    refresh_tokens_collection.insert_one(
        refresh_token_document.model_dump()
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
    }


def refresh_access_token(
    refresh_token: str
) -> dict:

    # 1. Decode the refresh JWT
    try:
        payload = jwt.decode(
            refresh_token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # 2. Make sure this is a refresh token
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    # 3. Get user ID and token ID from JWT
    user_id = payload.get("sub")
    token_id = payload.get("jti")

    if not user_id or not token_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload",
        )

    # 4. Find this exact refresh token in MongoDB
    stored_token = refresh_tokens_collection.find_one(
        {
            "token_id": token_id,
            "user_id": user_id,
        }
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
        )

    # 5. Check whether this token was already revoked
    if stored_token["revoked"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    # 6. Hash the refresh token received from the client
    received_token_hash = hash_refresh_token(
        refresh_token
    )

    # 7. Compare with the hash stored in MongoDB
    if received_token_hash != stored_token["token_hash"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # 8. Revoke the old refresh token
    refresh_tokens_collection.update_one(
        {"token_id": token_id},
        {
            "$set": {
                "revoked": True,
            }
        },
    )

    # 9. Create a new access token
    new_access_token = create_access_token(
        user_id=user_id
    )

    # 10. Create a new refresh token
    new_refresh_token, new_token_id = create_refresh_token(
        user_id=user_id
    )

    # 11. Hash the new refresh token
    new_refresh_token_hash = hash_refresh_token(
        new_refresh_token
    )

    # 12. Store the new refresh token
    new_refresh_token_document = RefreshToken(
        token_id=new_token_id,
        user_id=user_id,
        token_hash=new_refresh_token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(
            days=settings.jwt_refresh_token_expire_days
        ),
    )

    refresh_tokens_collection.insert_one(
        new_refresh_token_document.model_dump()
    )

    # 13. Return both new tokens
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


def logout_user(refresh_token: str) -> None:

    try:
        payload = jwt.decode(
            refresh_token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

    except jwt.InvalidTokenError:
        # Already invalid/expired — nothing to revoke
        return

    if payload.get("type") != "refresh":
        return

    token_id = payload.get("jti")

    if not token_id:
        return

    refresh_tokens_collection.update_one(
        {
            "token_id": token_id,
            "revoked": False,
        },
        {
            "$set": {
                "revoked": True,
            }
        },
    )