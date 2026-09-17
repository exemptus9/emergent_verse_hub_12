from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import re
import uuid

from database import db
from models import NewsletterSubscribe

router = APIRouter()


@router.post("/newsletter/subscribe")
async def newsletter_subscribe(data: NewsletterSubscribe):
    """Subscribe to the newsletter."""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    existing = await db.newsletter.find_one({"email": data.email.lower()})
    if existing:
        if existing.get("unsubscribed"):
            await db.newsletter.update_one(
                {"email": data.email.lower()},
                {"$set": {"unsubscribed": False, "resubscribedAt": datetime.now(timezone.utc).isoformat()}}
            )
            return {"success": True, "message": "Welcome back! You've been resubscribed."}
        return {"success": True, "message": "You're already subscribed!"}

    subscriber = {
        "id": str(uuid.uuid4()),
        "email": data.email.lower(),
        "subscribedAt": datetime.now(timezone.utc).isoformat(),
        "unsubscribed": False
    }
    await db.newsletter.insert_one(subscriber)

    return {"success": True, "message": "Successfully subscribed to the newsletter!"}


@router.post("/newsletter/unsubscribe")
async def newsletter_unsubscribe(data: NewsletterSubscribe):
    """Unsubscribe from the newsletter."""
    result = await db.newsletter.update_one(
        {"email": data.email.lower()},
        {"$set": {"unsubscribed": True, "unsubscribedAt": datetime.now(timezone.utc).isoformat()}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Email not found in subscribers")

    return {"success": True, "message": "Successfully unsubscribed"}
