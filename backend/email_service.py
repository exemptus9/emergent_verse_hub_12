import logging
import asyncio
from config import RESEND_API_KEY, ADMIN_EMAIL, SENDER_EMAIL, FRONTEND_URL

resend_client = None
if RESEND_API_KEY:
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend_client = resend
    except ImportError:
        pass


async def send_email_notification(to_email: str, subject: str, html_content: str):
    """Send an email using Resend (non-blocking)."""
    if not resend_client or not RESEND_API_KEY:
        logging.info(f"Email not sent (no API key configured): {subject}")
        return None

    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend_client.Emails.send, params)
        logging.info(f"Email sent successfully: {subject} to {to_email}")
        return result
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        return None


async def send_new_comment_notification(poem_title: str, poem_slug: str, author: str, content: str):
    """Send notification email when a new comment is posted."""
    if not ADMIN_EMAIL:
        return

    html = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1e73be;">
            <h1 style="color: #1e73be; margin: 0;">RhymeMosaic</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-style: italic;">New Comment Notification</p>
        </div>
        <div style="padding: 20px 0;">
            <h2 style="color: #333;">New comment on "{poem_title}"</h2>
            <p><strong>Author:</strong> {author}</p>
            <blockquote style="border-left: 3px solid #1e73be; padding-left: 15px; color: #555; margin: 15px 0;">
                {content}
            </blockquote>
            <p style="margin-top: 20px;">
                <a href="{FRONTEND_URL}/poem/{poem_slug}"
                   style="color: #1e73be; text-decoration: none;">View Poem →</a>
            </p>
        </div>
    </div>
    """

    await send_email_notification(ADMIN_EMAIL, f"New comment on '{poem_title}'", html)
