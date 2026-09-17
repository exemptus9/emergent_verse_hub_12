from fastapi import APIRouter, HTTPException, Request
import logging
import asyncio

from models import ContactMessageRequest
from config import RESEND_API_KEY, ADMIN_EMAIL, SENDER_EMAIL
from auth import check_contact_rate_limit
from email_service import resend_client

router = APIRouter()


@router.post("/contact")
async def send_contact_message(data: ContactMessageRequest, request: Request):
    """Send a contact form message to the admin via email."""
    client_ip = request.client.host if request.client else "unknown"
    if not check_contact_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many messages sent. Please try again later.")

    if not resend_client or not RESEND_API_KEY or not ADMIN_EMAIL:
        raise HTTPException(status_code=500, detail="Email service not configured")

    subject = data.subject or "Message from RhymeMosaic Website"
    html = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1e73be;">
            <h1 style="color: #1e73be; margin: 0;">RhymeMosaic</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-style: italic;">New Contact Message</p>
        </div>
        <div style="padding: 20px 0;">
            <p><strong>From:</strong> {data.name} ({data.email})</p>
            <p><strong>Subject:</strong> {subject}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            <div style="white-space: pre-line;">{data.message}</div>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            Reply directly to this email to respond to {data.name} at {data.email}.
        </p>
    </div>
    """

    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_EMAIL],
            "reply_to": data.email,
            "subject": f"[Contact] {subject}",
            "html": html
        }
        await asyncio.to_thread(resend_client.Emails.send, params)
        return {"success": True, "message": "Message sent successfully!"}
    except Exception as e:
        logging.error(f"Contact form email failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again later.")
