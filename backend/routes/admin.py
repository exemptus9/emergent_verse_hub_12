from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import Response, JSONResponse
from datetime import datetime, timezone, timedelta
import logging
import asyncio
import uuid

from database import db
from models import (
    PoemUpdate, AdminLogin, AdminChangePassword, BulkEmailRequest
)
from auth import (
    require_admin, check_rate_limit, create_admin_token, admin_sessions
)
from config import ADMIN_PASSWORD, RESEND_API_KEY, ADMIN_EMAIL, SENDER_EMAIL, FRONTEND_URL, update_admin_password
from email_service import send_email_notification, resend_client

router = APIRouter()


# ==================== ADMIN AUTH ====================

@router.post("/admin/login")
async def admin_login(login_data: AdminLogin, request: Request):
    """Verify admin password and return session token in an httpOnly cookie."""
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again later.")
    from config import ADMIN_PASSWORD as current_password
    if login_data.password == current_password:
        token = create_admin_token()
        response = JSONResponse({"success": True, "message": "Login successful", "token": token})
        response.set_cookie(
            key="admin_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=86400,
            path="/",
        )
        return response
    raise HTTPException(status_code=401, detail="Invalid password")


@router.post("/admin/change-password")
async def admin_change_password(data: AdminChangePassword, _auth: bool = Depends(require_admin)):
    """Change the admin password."""
    from config import ADMIN_PASSWORD as current_password
    if data.current_password != current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")
    update_admin_password(data.new_password)
    admin_sessions.clear()
    return {"success": True, "message": "Password changed successfully. Please log in again."}


@router.post("/admin/logout")
async def admin_logout():
    """Clear the admin auth cookie."""
    response = JSONResponse({"success": True, "message": "Logged out"})
    response.delete_cookie(key="admin_token", path="/")
    return response


# ==================== ADMIN POEMS ====================

@router.get("/admin/poems/{poem_id}")
async def admin_get_poem(poem_id: str, _auth: bool = Depends(require_admin)):
    """Get a single poem by ID for admin editing."""
    poem = await db.poems.find_one({"id": poem_id}, {"_id": 0})
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    return {"poem": poem}


@router.put("/admin/poems/{poem_id}")
async def admin_update_poem(poem_id: str, poem_data: PoemUpdate, _auth: bool = Depends(require_admin)):
    """Update a poem."""
    existing = await db.poems.find_one({"id": poem_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Poem not found")

    update_dict = {k: v for k, v in poem_data.model_dump().items() if v is not None}

    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    if 'slug' in update_dict and update_dict['slug'] != existing.get('slug'):
        slug_exists = await db.poems.find_one({"slug": update_dict['slug'], "id": {"$ne": poem_id}})
        if slug_exists:
            raise HTTPException(status_code=400, detail="A poem with this slug already exists")

    await db.poems.update_one({"id": poem_id}, {"$set": update_dict})

    updated = await db.poems.find_one({"id": poem_id}, {"_id": 0})
    return {"poem": updated, "message": "Poem updated successfully"}


@router.delete("/admin/poems/{poem_id}")
async def admin_delete_poem(poem_id: str, _auth: bool = Depends(require_admin)):
    existing = await db.poems.find_one({"id": poem_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Poem not found")

    await db.poems.delete_one({"id": poem_id})
    await db.ratings.delete_many({"poemId": poem_id})
    await db.comments.delete_many({"poemId": poem_id})

    return {"message": "Poem and associated data deleted successfully"}


# ==================== ADMIN COMMENTS ====================

@router.delete("/admin/comments/{comment_id}")
async def admin_delete_comment(comment_id: str, _auth: bool = Depends(require_admin)):
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    poem_id = comment.get("poemId")
    await db.comments.delete_one({"id": comment_id})

    if poem_id:
        await db.poems.update_one(
            {"id": poem_id},
            {"$inc": {"comments": -1}}
        )

    return {"message": "Comment deleted successfully"}


@router.get("/admin/all-comments")
async def admin_get_all_comments(_auth: bool = Depends(require_admin)):
    """Get all comments for admin management."""
    comments = await db.comments.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)

    poem_ids = list({c.get("poemId") for c in comments if c.get("poemId")})
    poems = await db.poems.find({"id": {"$in": poem_ids}}, {"_id": 0, "id": 1, "title": 1, "slug": 1}).to_list(len(poem_ids))
    poem_map = {p["id"]: p for p in poems}

    for comment in comments:
        poem = poem_map.get(comment.get("poemId"))
        if poem:
            comment["poemTitle"] = poem.get("title")
            comment["poemSlug"] = poem.get("slug")

    return {"comments": comments}


@router.get("/admin/pending-comments")
async def admin_get_pending_comments(_auth: bool = Depends(require_admin)):
    """Get all pending comments awaiting approval."""
    comments = await db.comments.find(
        {"approved": False},
        {"_id": 0}
    ).sort("createdAt", -1).to_list(1000)

    poem_ids = list({c.get("poemId") for c in comments if c.get("poemId")})
    poems = await db.poems.find({"id": {"$in": poem_ids}}, {"_id": 0, "id": 1, "title": 1, "slug": 1}).to_list(len(poem_ids))
    poem_map = {p["id"]: p for p in poems}

    for comment in comments:
        poem = poem_map.get(comment.get("poemId"))
        if poem:
            comment["poemTitle"] = poem.get("title")
            comment["poemSlug"] = poem.get("slug")

    return {"comments": comments}


@router.post("/admin/comments/{comment_id}/approve")
async def admin_approve_comment(comment_id: str, _auth: bool = Depends(require_admin)):
    """Approve a pending comment."""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    await db.comments.update_one(
        {"id": comment_id},
        {"$set": {"approved": True}}
    )

    poem_id = comment.get("poemId")
    if poem_id:
        await db.poems.update_one(
            {"id": poem_id},
            {"$inc": {"comments": 1}}
        )

    return {"message": "Comment approved"}


@router.post("/admin/comments/{comment_id}/reject")
async def admin_reject_comment(comment_id: str, _auth: bool = Depends(require_admin)):
    """Reject and delete a pending comment."""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    await db.comments.delete_one({"id": comment_id})

    return {"message": "Comment rejected and deleted"}


# ==================== ADMIN STATS & ANALYTICS ====================

@router.get("/admin/stats")
async def admin_get_stats(_auth: bool = Depends(require_admin)):
    """Get admin dashboard statistics."""
    poems_count = await db.poems.count_documents({})
    comments_count = await db.comments.count_documents({})
    ratings_count = await db.ratings.count_documents({})
    subscribers_count = await db.newsletter.count_documents({"unsubscribed": {"$ne": True}})

    pipeline = [
        {"$group": {"_id": None, "avgRating": {"$avg": "$rating"}, "totalRatings": {"$sum": "$ratingCount"}}}
    ]
    avg_result = await db.poems.aggregate(pipeline).to_list(1)
    avg_rating = avg_result[0]["avgRating"] if avg_result else 0
    total_ratings = avg_result[0]["totalRatings"] if avg_result else 0

    views_pipeline = [{"$group": {"_id": None, "totalViews": {"$sum": "$views"}}}]
    views_result = await db.poems.aggregate(views_pipeline).to_list(1)
    total_views = views_result[0]["totalViews"] if views_result else 0

    recent_comments = await db.comments.find({}, {"_id": 0}).sort("createdAt", -1).to_list(5)

    unread_notifications = await db.notifications.count_documents({"read": False})

    return {
        "poemsCount": poems_count,
        "commentsCount": comments_count,
        "ratingsCount": ratings_count,
        "averageRating": round(avg_rating, 2) if avg_rating else 0,
        "totalRatings": total_ratings,
        "totalViews": total_views,
        "subscribersCount": subscribers_count,
        "unreadNotifications": unread_notifications,
        "recentComments": recent_comments
    }


# ==================== ADMIN NOTIFICATIONS ====================

@router.get("/admin/notifications")
async def admin_get_notifications(limit: int = 20, _auth: bool = Depends(require_admin)):
    """Get admin notifications."""
    notifications = await db.notifications.find(
        {},
        {"_id": 0}
    ).sort("createdAt", -1).limit(limit).to_list(limit)

    unread_count = await db.notifications.count_documents({"read": False})

    return {"notifications": notifications, "unreadCount": unread_count}


@router.post("/admin/notifications/{notification_id}/read")
async def admin_mark_notification_read(notification_id: str, _auth: bool = Depends(require_admin)):
    """Mark a notification as read."""
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"read": True, "readAt": datetime.now(timezone.utc).isoformat()}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True, "message": "Notification marked as read"}


@router.post("/admin/notifications/read-all")
async def admin_mark_all_notifications_read(_auth: bool = Depends(require_admin)):
    """Mark all notifications as read."""
    result = await db.notifications.update_many(
        {"read": False},
        {"$set": {"read": True, "readAt": datetime.now(timezone.utc).isoformat()}}
    )

    return {"success": True, "count": result.modified_count}


@router.delete("/admin/notifications/{notification_id}")
async def admin_delete_notification(notification_id: str, _auth: bool = Depends(require_admin)):
    """Delete a notification."""
    result = await db.notifications.delete_one({"id": notification_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True, "message": "Notification deleted"}


# ==================== ADMIN ANALYTICS ====================


async def _fetch_most_viewed_poems(limit: int = 10) -> list:
    return await db.poems.find(
        {"views": {"$gt": 0}},
        {"_id": 0, "id": 1, "title": 1, "slug": 1, "views": 1}
    ).sort("views", -1).limit(limit).to_list(limit)


async def _fetch_top_rated_poems(limit: int = 10) -> list:
    return await db.poems.find(
        {"ratingCount": {"$gt": 0}},
        {"_id": 0, "id": 1, "title": 1, "slug": 1, "rating": 1, "ratingCount": 1}
    ).sort("rating", -1).limit(limit).to_list(limit)


async def _fetch_rating_distribution() -> list:
    return await db.poems.aggregate([
        {"$match": {"ratingCount": {"$gt": 0}}},
        {"$bucket": {
            "groupBy": "$rating",
            "boundaries": [0, 1, 2, 3, 4, 5.1],
            "default": "other",
            "output": {"count": {"$sum": 1}}
        }}
    ]).to_list(10)


async def _fetch_taxonomy_stats() -> tuple:
    category_stats = await db.poems.aggregate([
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories", "poemCount": {"$sum": 1}, "totalViews": {"$sum": {"$ifNull": ["$views", 0]}}, "avgRating": {"$avg": "$rating"}}},
        {"$sort": {"poemCount": -1}}, {"$limit": 10}
    ]).to_list(10)

    tag_stats = await db.poems.aggregate([
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "poemCount": {"$sum": 1}, "totalViews": {"$sum": {"$ifNull": ["$views", 0]}}}},
        {"$sort": {"poemCount": -1}}, {"$limit": 15}
    ]).to_list(15)

    return category_stats, tag_stats


async def _fetch_recent_ratings() -> list:
    recent_ratings = await db.ratings.find(
        {}, {"_id": 0, "poemId": 1, "rating": 1, "createdAt": 1}
    ).sort("createdAt", -1).limit(10).to_list(10)

    rating_poem_ids = list({r["poemId"] for r in recent_ratings})
    if rating_poem_ids:
        rating_poems = await db.poems.find(
            {"id": {"$in": rating_poem_ids}}, {"_id": 0, "id": 1, "title": 1, "slug": 1}
        ).to_list(len(rating_poem_ids))
        poem_map = {p["id"]: p for p in rating_poems}
        for r in recent_ratings:
            poem = poem_map.get(r["poemId"])
            if poem:
                r["poemTitle"] = poem.get("title")
                r["poemSlug"] = poem.get("slug")
    return recent_ratings


async def _fetch_summary_counts() -> dict:
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    total_views_result = await db.poems.aggregate([
        {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$views", 0]}}}}
    ]).to_list(1)
    return {
        "totalPoems": await db.poems.count_documents({}),
        "totalViews": total_views_result[0]["total"] if total_views_result else 0,
        "totalRatings": await db.ratings.count_documents({}),
        "totalComments": await db.comments.count_documents({}),
        "pendingComments": await db.comments.count_documents({"approved": False}),
        "totalSubscribers": await db.newsletter.count_documents({"unsubscribed": {"$ne": True}}),
        "newSubscribers30d": await db.newsletter.count_documents({
            "subscribedAt": {"$gte": thirty_days_ago},
            "unsubscribed": {"$ne": True}
        }),
    }


@router.get("/admin/analytics")
async def admin_get_analytics(_auth: bool = Depends(require_admin)):
    """Get comprehensive analytics data."""
    most_viewed = await _fetch_most_viewed_poems()
    top_rated = await _fetch_top_rated_poems()
    rating_distribution = await _fetch_rating_distribution()
    category_stats, tag_stats = await _fetch_taxonomy_stats()
    recent_ratings = await _fetch_recent_ratings()
    summary = await _fetch_summary_counts()

    return {
        "summary": summary,
        "mostViewed": most_viewed,
        "topRated": top_rated,
        "ratingDistribution": rating_distribution,
        "categoryStats": category_stats,
        "tagStats": tag_stats,
        "recentRatings": recent_ratings,
    }


# ==================== ADMIN SUBSCRIBERS & NEWSLETTER ====================

@router.get("/admin/subscribers")
async def admin_get_subscribers(_auth: bool = Depends(require_admin)):
    """Get all newsletter subscribers."""
    subscribers = await db.newsletter.find(
        {"unsubscribed": {"$ne": True}},
        {"_id": 0}
    ).sort("subscribedAt", -1).to_list(1000)

    return {"subscribers": subscribers, "count": len(subscribers)}


@router.post("/admin/newsletter/send")
async def admin_send_newsletter(request: BulkEmailRequest, _auth: bool = Depends(require_admin)):
    """Send a newsletter to all subscribers."""
    if not resend_client or not RESEND_API_KEY:
        raise HTTPException(status_code=400, detail="Email service not configured. Please add RESEND_API_KEY to .env")

    subscribers = await db.newsletter.find(
        {"unsubscribed": {"$ne": True}},
        {"_id": 0, "email": 1}
    ).to_list(10000)

    if not subscribers:
        raise HTTPException(status_code=400, detail="No subscribers found")

    html_template = f"""
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1e73be;">
            <h1 style="color: #1e73be; margin: 0;">RhymeMosaic</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-style: italic;">Meter, Metaphor, Memory + Meaning</p>
        </div>
        <div style="padding: 20px 0;">
            {request.content}
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            You're receiving this because you subscribed to RhymeMosaic.
            <br>
            <a href="{FRONTEND_URL}" style="color: #1e73be;">Visit our website</a>
        </p>
    </div>
    """

    if request.test_mode:
        if not ADMIN_EMAIL:
            raise HTTPException(status_code=400, detail="ADMIN_EMAIL not configured for test mode")

        await send_email_notification(ADMIN_EMAIL, f"[TEST] {request.subject}", html_template)
        return {
            "success": True,
            "message": f"Test email sent to {ADMIN_EMAIL}",
            "sentCount": 1
        }

    sent_count = 0
    failed_count = 0

    for sub in subscribers:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [sub["email"]],
                "subject": request.subject,
                "html": html_template
            }
            await asyncio.to_thread(resend_client.Emails.send, params)
            sent_count += 1
        except Exception as e:
            logging.error(f"Failed to send to {sub['email']}: {str(e)}")
            failed_count += 1

    newsletter_log = {
        "id": str(uuid.uuid4()),
        "subject": request.subject,
        "sentAt": datetime.now(timezone.utc).isoformat(),
        "totalSubscribers": len(subscribers),
        "sentCount": sent_count,
        "failedCount": failed_count
    }
    await db.newsletter_logs.insert_one(newsletter_log)

    return {
        "success": True,
        "message": f"Newsletter sent to {sent_count} subscribers",
        "sentCount": sent_count,
        "failedCount": failed_count
    }


@router.get("/admin/newsletter/logs")
async def admin_get_newsletter_logs(_auth: bool = Depends(require_admin)):
    """Get newsletter send logs."""
    logs = await db.newsletter_logs.find({}, {"_id": 0}).sort("sentAt", -1).limit(20).to_list(20)
    return {"logs": logs}


@router.get("/admin/email-status")
async def admin_get_email_status(_auth: bool = Depends(require_admin)):
    """Check if email service is configured."""
    return {
        "configured": bool(RESEND_API_KEY),
        "adminEmail": ADMIN_EMAIL or None,
        "senderEmail": SENDER_EMAIL
    }


# ==================== ADMIN EXPORTS ====================

@router.get("/admin/export/poems/json")
async def admin_export_poems_json(_auth: bool = Depends(require_admin)):
    """Export all poems as JSON."""
    poems = await db.poems.find({}, {"_id": 0}).to_list(10000)
    return {"poems": poems, "exportedAt": datetime.now(timezone.utc).isoformat(), "count": len(poems)}


@router.get("/admin/export/poems/csv")
async def admin_export_poems_csv(_auth: bool = Depends(require_admin)):
    """Export all poems as CSV."""
    import csv
    import io

    poems = await db.poems.find({}, {"_id": 0}).to_list(10000)

    output = io.StringIO()
    if poems:
        fieldnames = ["id", "title", "slug", "author", "date", "rating", "ratingCount", "views", "categories", "tags", "content"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()

        for poem in poems:
            row = {
                "id": poem.get("id", ""),
                "title": poem.get("title", ""),
                "slug": poem.get("slug", ""),
                "author": poem.get("author", ""),
                "date": poem.get("date", ""),
                "rating": poem.get("rating", 0),
                "ratingCount": poem.get("ratingCount", 0),
                "views": poem.get("views", 0),
                "categories": "|".join(poem.get("categories", [])),
                "tags": "|".join(poem.get("tags", [])),
                "content": poem.get("content", "").replace("\n", "\\n")
            }
            writer.writerow(row)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=poems_export_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"}
    )


@router.get("/admin/export/subscribers/csv")
async def admin_export_subscribers_csv(_auth: bool = Depends(require_admin)):
    """Export newsletter subscribers as CSV."""
    import csv
    import io

    subscribers = await db.newsletter.find({"unsubscribed": {"$ne": True}}, {"_id": 0}).to_list(10000)

    output = io.StringIO()
    if subscribers:
        fieldnames = ["email", "subscribedAt"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for sub in subscribers:
            writer.writerow({"email": sub.get("email"), "subscribedAt": sub.get("subscribedAt")})

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=subscribers_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"}
    )


@router.get("/admin/export/poems/pdf")
async def admin_export_poems_pdf(_auth: bool = Depends(require_admin)):
    """Export all poems as a beautifully formatted PDF."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    import io

    poems = await db.poems.find({}, {"_id": 0}).sort("title", 1).to_list(10000)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'PoemTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=6,
        textColor='#1e73be',
        alignment=TA_CENTER
    )

    meta_style = ParagraphStyle(
        'PoemMeta',
        parent=styles['Normal'],
        fontSize=9,
        textColor='#666666',
        alignment=TA_CENTER,
        spaceAfter=20
    )

    body_style = ParagraphStyle(
        'PoemBody',
        parent=styles['Normal'],
        fontSize=11,
        leading=16,
        alignment=TA_LEFT,
        spaceAfter=30
    )

    cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Title'],
        fontSize=28,
        spaceAfter=20,
        alignment=TA_CENTER
    )

    cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor='#666666',
        alignment=TA_CENTER
    )

    story = []

    story.append(Spacer(1, 2*inch))
    story.append(Paragraph("RhymeMosaic", cover_title))
    story.append(Paragraph("Meter, Metaphor, Memory + Meaning", cover_subtitle))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("by Brandon WordSmith", cover_subtitle))
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph(f"Collection of {len(poems)} Poems", meta_style))
    story.append(Paragraph(f"Exported: {datetime.now(timezone.utc).strftime('%B %d, %Y')}", meta_style))
    story.append(PageBreak())

    for i, poem in enumerate(poems):
        story.append(Paragraph(poem.get('title', 'Untitled'), title_style))

        meta_parts = []
        if poem.get('author'):
            meta_parts.append(f"by {poem['author']}")
        if poem.get('date'):
            meta_parts.append(poem['date'])
        if meta_parts:
            story.append(Paragraph(" • ".join(meta_parts), meta_style))

        content = poem.get('content', '')
        content_html = content.replace('\n', '<br/>')
        story.append(Paragraph(content_html, body_style))

        if i < len(poems) - 1:
            story.append(PageBreak())

    doc.build(story)
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=RhymeMosaic_Collection_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"}
    )
