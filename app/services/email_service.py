import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_otp_email(
    recipient: str,
    otp: str
) -> None:

    message = EmailMessage()

    message["Subject"] = "AI Interview Platform - Email Verification"
    message["From"] = settings.email_username
    message["To"] = recipient

    message.set_content(
        f"""
Hello,

Your OTP for the AI Interview Platform is:

{otp}

This OTP will expire in 10 minutes.

If you did not request this verification, you can safely ignore this email.

Regards,
AI Interview Platform
"""
    )

    with smtplib.SMTP(
        settings.email_host,
        settings.email_port
    ) as server:

        server.starttls()

        server.login(
            settings.email_username,
            settings.email_password
        )

        server.send_message(message)