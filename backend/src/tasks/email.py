import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from src.tasks.celery_app import celery_app
from src.core.config import settings

logger = logging.getLogger(__name__)


def _send_email(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_HOST:
        logger.warning("SMTP not configured — email not sent to %s", to)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM, to, msg.as_string())


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email(self, to: str, first_name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#1f2328">Verify your Skillmate account</h2>
      <p style="color:#636c76">Hi {first_name}, thanks for joining Skillmate.</p>
      <p style="color:#636c76">Click the button below to verify your university email and activate your account.</p>
      <a href="{link}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#0969da;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="color:#636c76;font-size:12px">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    </div>
    """
    try:
        _send_email(to, "Verify your Skillmate email", html)
    except Exception as exc:
        logger.error("Failed to send verification email to %s: %s", to, exc)
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, to: str, first_name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#1f2328">Reset your password</h2>
      <p style="color:#636c76">Hi {first_name}, we received a request to reset your Skillmate password.</p>
      <a href="{link}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#0969da;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
        Reset Password
      </a>
      <p style="color:#636c76;font-size:12px">This link expires in 2 hours. If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    try:
        _send_email(to, "Reset your Skillmate password", html)
    except Exception as exc:
        logger.error("Failed to send reset email to %s: %s", to, exc)
        raise self.retry(exc=exc)
