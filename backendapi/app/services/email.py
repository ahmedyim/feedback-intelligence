# utils.py
from fastapi_mail import FastMail, MessageSchema, MessageType
from core.config import settings, mail_config

async def send_reset_password_email(email_to: str, token: str):
    reset_url = f"https://app.fineto.fi/reset-password?token={token}"

    html_content = f"""
    <h2>Reset Your Password</h2>
    <p>You requested a password reset for your Fineto account.</p>
    <p>Click the link below to set a new password. This link will expire in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes:</p>
    <a href="{reset_url}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
    """

    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html,
    )

    fm = FastMail(mail_config)
    await fm.send_message(message)