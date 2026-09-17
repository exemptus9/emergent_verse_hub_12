from fastapi import APIRouter
from database import db

router = APIRouter()


@router.get("/categories")
async def get_categories():
    """Get all categories with poem counts."""
    pipeline = [
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    results = await db.poems.aggregate(pipeline).to_list(1000)
    categories = [{"name": r["_id"], "count": r["count"]} for r in results]
    return {"categories": categories}


@router.get("/tags")
async def get_tags():
    """Get all tags with poem counts."""
    pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    results = await db.poems.aggregate(pipeline).to_list(1000)
    tags = [{"name": r["_id"], "count": r["count"]} for r in results]
    return {"tags": tags}
