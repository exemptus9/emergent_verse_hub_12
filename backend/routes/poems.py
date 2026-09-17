from fastapi import APIRouter, HTTPException, Request, Query
from typing import Optional
from datetime import datetime, timezone
import uuid
import asyncio

from database import db
from models import Poem, PoemCreate, RatingCreate, Rating, Comment, CommentCreate
from auth import get_visitor_id
from email_service import send_new_comment_notification

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "RhymeMosaic API"}


@router.get("/poem-of-the-day")
async def get_poem_of_the_day():
    """Get a deterministic 'Poem of the Day' based on the current date."""
    today = datetime.now(timezone.utc).date()
    date_seed = today.year * 10000 + today.month * 100 + today.day

    total_poems = await db.poems.count_documents({})
    if total_poems == 0:
        return {"poem": None}

    poem_index = date_seed % total_poems
    poem = await db.poems.find({}, {"_id": 0}).skip(poem_index).limit(1).to_list(1)

    if poem:
        return {"poem": poem[0], "date": today.isoformat()}
    return {"poem": None}


@router.get("/random-poem")
async def get_random_poem():
    """Get a truly random poem."""
    import random

    total_poems = await db.poems.count_documents({})
    if total_poems == 0:
        return {"poem": None}

    random_index = random.randint(0, total_poems - 1)
    poem = await db.poems.find({}, {"_id": 0}).skip(random_index).limit(1).to_list(1)

    if poem:
        return {"poem": poem[0]}
    return {"poem": None}


@router.get("/poems")
async def get_poems(
    sort: str = Query("newest", enum=["newest", "oldest", "rating-high", "rating-low", "most-rated", "most-viewed"]),
    category: Optional[str] = None,
    tag: Optional[str] = None
):
    """Get all poems with optional sorting and filtering."""
    query = {}

    if category:
        query["categories"] = {"$regex": f"^{category}$", "$options": "i"}
    if tag:
        query["tags"] = {"$regex": f"^{tag}$", "$options": "i"}

    sort_map = {
        "newest": [("createdAt", -1)],
        "oldest": [("createdAt", 1)],
        "rating-high": [("rating", -1)],
        "rating-low": [("rating", 1)],
        "most-rated": [("ratingCount", -1)],
        "most-viewed": [("views", -1)]
    }
    sort_order = sort_map.get(sort, [("createdAt", -1)])

    poems = await db.poems.find(query, {"_id": 0}).sort(sort_order).skip(0).limit(500).to_list(500)

    for poem in poems:
        if isinstance(poem.get('createdAt'), str):
            poem['createdAt'] = datetime.fromisoformat(poem['createdAt'])

    return {"poems": poems}


@router.get("/poems/slug/{slug}")
async def get_poem_by_slug(slug: str):
    """Get a single poem by slug."""
    poem = await db.poems.find_one({"slug": slug}, {"_id": 0})
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    return {"poem": poem}


@router.post("/poems/{poem_id}/view")
async def record_poem_view(poem_id: str, request: Request):
    """Record a view for a poem."""
    visitor_id = get_visitor_id(request)

    poem = await db.poems.find_one({"id": poem_id})
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    view_key = f"{poem_id}_{visitor_id}"
    recent_view = await db.poem_views.find_one({
        "viewKey": view_key,
        "timestamp": {"$gte": datetime.now(timezone.utc).isoformat()[:-7]}
    })

    if not recent_view:
        await db.poem_views.insert_one({
            "viewKey": view_key,
            "poemId": poem_id,
            "visitorId": visitor_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        await db.poems.update_one(
            {"id": poem_id},
            {"$inc": {"views": 1}}
        )

    updated_poem = await db.poems.find_one({"id": poem_id}, {"views": 1})
    return {"views": updated_poem.get("views", 0)}


@router.get("/poems/most-viewed")
async def get_most_viewed_poems(limit: int = 5):
    """Get the most viewed poems."""
    poems = await db.poems.find(
        {},
        {"_id": 0}
    ).sort("views", -1).limit(limit).to_list(limit)

    return {"poems": poems}


@router.post("/poems", response_model=Poem)
async def create_poem(poem_data: PoemCreate):
    """Create a new poem."""
    existing = await db.poems.find_one({"slug": poem_data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="A poem with this slug already exists")

    poem = Poem(**poem_data.model_dump())
    doc = poem.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()

    await db.poems.insert_one(doc)
    return poem


# ==================== RATING ROUTES ====================

@router.post("/poems/{poem_id}/rate")
async def rate_poem(poem_id: str, rating_data: RatingCreate, request: Request):
    """Rate a poem. Each visitor can only rate once per poem."""
    visitor_id = get_visitor_id(request)

    poem = await db.poems.find_one({"id": poem_id})
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    existing_rating = await db.ratings.find_one({
        "poemId": poem_id,
        "visitorId": visitor_id
    })

    if existing_rating:
        raise HTTPException(status_code=400, detail="You have already rated this poem")

    rating = Rating(
        poemId=poem_id,
        visitorId=visitor_id,
        rating=rating_data.rating
    )
    doc = rating.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    await db.ratings.insert_one(doc)

    new_count = poem.get('ratingCount', 0) + 1
    new_sum = poem.get('totalRatingSum', 0) + rating_data.rating
    new_rating = new_sum / new_count

    await db.poems.update_one(
        {"id": poem_id},
        {"$set": {
            "rating": round(new_rating, 2),
            "ratingCount": new_count,
            "totalRatingSum": new_sum
        }}
    )

    return {
        "success": True,
        "newRating": round(new_rating, 2),
        "ratingCount": new_count,
        "userRating": rating_data.rating
    }


@router.get("/poems/{poem_id}/rating-status")
async def get_rating_status(poem_id: str, request: Request):
    """Check if the current visitor has already rated this poem."""
    visitor_id = get_visitor_id(request)

    existing_rating = await db.ratings.find_one({
        "poemId": poem_id,
        "visitorId": visitor_id
    }, {"_id": 0})

    if existing_rating:
        return {
            "hasRated": True,
            "userRating": existing_rating.get("rating")
        }

    return {"hasRated": False}


# ==================== COMMENT ROUTES ====================

@router.get("/poems/{poem_id}/comments")
async def get_comments(poem_id: str):
    """Get all approved comments for a poem."""
    comments = await db.comments.find(
        {"poemId": poem_id, "approved": {"$ne": False}},
        {"_id": 0}
    ).sort("createdAt", 1).to_list(200)

    return {"comments": comments}


@router.post("/poems/{poem_id}/comments")
async def add_comment(poem_id: str, comment_data: CommentCreate):
    """Add a comment to a poem (pending approval)."""
    poem = await db.poems.find_one({"id": poem_id})
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")

    comment = Comment(
        poemId=poem_id,
        author=comment_data.author or "Guest",
        content=comment_data.content
    )
    doc = comment.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    doc['approved'] = False

    await db.comments.insert_one(doc)

    notification = {
        "id": str(uuid.uuid4()),
        "type": "new_comment",
        "title": f"New comment on '{poem.get('title', 'Unknown')}'",
        "message": f"{comment_data.author or 'Guest'} commented: {comment_data.content[:100]}{'...' if len(comment_data.content) > 100 else ''}",
        "poemId": poem_id,
        "poemSlug": poem.get('slug'),
        "poemTitle": poem.get('title'),
        "commentId": doc['id'],
        "read": False,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)

    asyncio.create_task(send_new_comment_notification(
        poem.get('title', 'Unknown'),
        poem.get('slug', ''),
        comment_data.author or 'Guest',
        comment_data.content
    ))

    response_doc = {k: v for k, v in doc.items() if k != '_id'}
    return {"comment": response_doc, "message": "Comment submitted for approval"}
