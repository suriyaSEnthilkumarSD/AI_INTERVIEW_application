from fastapi import APIRouter, status

from app.schemas.auth import (
    RegisterRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest,
    LogoutRequest,

)
from app.services.auth_service import (
    register_user,
    verify_user_otp,
    resend_otp,
    login_user,
    refresh_access_token,
    logout_user,
)

from app.schemas.auth import RefreshTokenRequest

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(data: RegisterRequest):
    user = register_user(data)

    return {
        "message": "Registration successful. Please verify your OTP.",
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
    }


@router.post(
    "/verify-otp"
)
def verify_otp(data: VerifyOTPRequest):
    verify_user_otp(data)

    return {
        "message": "Account verified successfully."
    }

@router.post("/resend-otp")
def resend_otp_endpoint(data: ResendOTPRequest):

    resend_otp(data)

    return {
        "message": "A new OTP has been sent to your email."
    }


@router.post("/login")
def login(data: LoginRequest):


    result = login_user(data)

    return {
        "message": "Login successful",
        **result,
    }

@router.post("/refresh")
def refresh_token(data: RefreshTokenRequest):

    return refresh_access_token(
        data.refresh_token
    )

@router.post("/logout")
def logout(data: LogoutRequest):

    logout_user(data.refresh_token)

    return {
        "message": "Logout successful"
    }