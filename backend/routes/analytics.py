from fastapi import APIRouter, Request, Depends, BackgroundTasks
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
import hashlib
import logging
import httpx

from database import db
from auth import require_admin

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory set to avoid re-resolving same IPs within a server restart cycle
_resolved_ips: set[str] = set()


class PageViewEvent(BaseModel):
    visitor_id: str
    path: str
    referrer: Optional[str] = ""
    session_id: Optional[str] = ""


def _extract_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip", "")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"


def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


async def _resolve_geo(ip: str, ip_hash: str) -> None:
    """Background task: look up IP geolocation and cache it."""
    if ip in ("unknown", "127.0.0.1", "localhost", "::1") or ip.startswith("10.") or ip.startswith("192.168."):
        return
    try:
        cached = await db.geo_cache.find_one({"ip_hash": ip_hash})
        if cached:
            return
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,city,lat,lon")
            data = resp.json()
        if data.get("status") == "success":
            await db.geo_cache.update_one(
                {"ip_hash": ip_hash},
                {"$set": {
                    "ip_hash": ip_hash,
                    "country": data.get("country", ""),
                    "countryCode": data.get("countryCode", ""),
                    "city": data.get("city", ""),
                    "lat": data.get("lat", 0),
                    "lon": data.get("lon", 0),
                    "resolved_at": datetime.now(timezone.utc).isoformat(),
                }},
                upsert=True
            )
    except Exception as exc:
        logger.debug("Geo lookup failed for %s: %s", ip_hash, exc)


# ── Tracking endpoint ──────────────────────────────────────────────


@router.post("/analytics/track")
async def track_page_view(event: PageViewEvent, request: Request, bg: BackgroundTasks) -> dict:
    """Record a page view. Public endpoint, lightweight."""
    ip = _extract_ip(request)
    ip_hash = _hash_ip(ip)

    doc = {
        "visitor_id": event.visitor_id[:64],
        "path": event.path[:500],
        "referrer": (event.referrer or "")[:500],
        "session_id": (event.session_id or "")[:64],
        "ip_hash": ip_hash,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.page_views.insert_one(doc)

    if ip_hash not in _resolved_ips:
        _resolved_ips.add(ip_hash)
        bg.add_task(_resolve_geo, ip, ip_hash)

    return {"ok": True}


# ── Analytics helpers ──────────────────────────────────────────────


async def _fetch_overview(today_start: str, week_start: str, month_start: str) -> dict:
    """Fetch aggregate view counts and unique visitor counts."""
    total_views = await db.page_views.count_documents({})
    today_views = await db.page_views.count_documents({"timestamp": {"$gte": today_start}})
    week_views = await db.page_views.count_documents({"timestamp": {"$gte": week_start}})
    month_views = await db.page_views.count_documents({"timestamp": {"$gte": month_start}})

    total_unique_result = await db.page_views.aggregate([
        {"$group": {"_id": "$visitor_id"}},
        {"$count": "count"}
    ]).to_list(1)
    total_unique = total_unique_result[0]["count"] if total_unique_result else 0
    today_unique = len(await db.page_views.distinct("visitor_id", {"timestamp": {"$gte": today_start}}))
    week_unique = len(await db.page_views.distinct("visitor_id", {"timestamp": {"$gte": week_start}}))
    month_unique = len(await db.page_views.distinct("visitor_id", {"timestamp": {"$gte": month_start}}))

    return {
        "totalViews": total_views, "todayViews": today_views,
        "weekViews": week_views, "monthViews": month_views,
        "totalUnique": total_unique, "todayUnique": today_unique,
        "weekUnique": week_unique, "monthUnique": month_unique,
    }


async def _fetch_daily_trend(range_start: str, days: int) -> list[dict]:
    """Daily views + unique visitors for the date range."""
    pipeline = [
        {"$match": {"timestamp": {"$gte": range_start}}},
        {"$addFields": {"date": {"$substr": ["$timestamp", 0, 10]}}},
        {"$group": {"_id": "$date", "views": {"$sum": 1}, "visitors": {"$addToSet": "$visitor_id"}}},
        {"$project": {"_id": 1, "views": 1, "visitors": {"$size": "$visitors"}}},
        {"$sort": {"_id": 1}}
    ]
    raw = await db.page_views.aggregate(pipeline).to_list(days + 1)
    return [{"date": row["_id"], "views": row["views"], "visitors": row["visitors"]} for row in raw]


async def _fetch_top_pages(range_start: str) -> list[dict]:
    pipeline = [
        {"$match": {"timestamp": {"$gte": range_start}}},
        {"$group": {"_id": "$path", "views": {"$sum": 1}, "visitors": {"$addToSet": "$visitor_id"}}},
        {"$project": {"_id": 1, "views": 1, "visitors": {"$size": "$visitors"}}},
        {"$sort": {"views": -1}}, {"$limit": 15}
    ]
    raw = await db.page_views.aggregate(pipeline).to_list(15)
    return [{"path": row["_id"], "views": row["views"], "visitors": row["visitors"]} for row in raw]


async def _fetch_peak_hours(range_start: str) -> list[dict]:
    pipeline = [
        {"$match": {"timestamp": {"$gte": range_start}}},
        {"$addFields": {"hour": {"$substr": ["$timestamp", 11, 2]}}},
        {"$group": {"_id": "$hour", "views": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    raw = await db.page_views.aggregate(pipeline).to_list(24)
    return [{"hour": int(row["_id"]), "views": row["views"]} for row in raw]


def _compute_day_of_week(daily_trend: list[dict]) -> list[dict]:
    counts = [0] * 7
    for entry in daily_trend:
        try:
            counts[datetime.fromisoformat(entry["date"]).weekday()] += entry["views"]
        except Exception:
            pass
    names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [{"day": names[i], "views": counts[i]} for i in range(7)]


async def _fetch_visitor_types() -> dict:
    pipeline = [
        {"$group": {"_id": "$visitor_id", "visit_count": {"$sum": 1}}},
        {"$group": {
            "_id": None,
            "new_visitors": {"$sum": {"$cond": [{"$eq": ["$visit_count", 1]}, 1, 0]}},
            "returning_visitors": {"$sum": {"$cond": [{"$gt": ["$visit_count", 1]}, 1, 0]}}
        }}
    ]
    result = await db.page_views.aggregate(pipeline).to_list(1)
    return {
        "new": result[0]["new_visitors"] if result else 0,
        "returning": result[0]["returning_visitors"] if result else 0,
    }


async def _fetch_top_referrers(range_start: str) -> list[dict]:
    pipeline = [
        {"$match": {"timestamp": {"$gte": range_start}, "referrer": {"$ne": ""}}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 10}
    ]
    raw = await db.page_views.aggregate(pipeline).to_list(10)
    return [{"referrer": row["_id"], "count": row["count"]} for row in raw]


async def _fetch_session_stats(range_start: str) -> dict:
    pipeline = [
        {"$match": {"timestamp": {"$gte": range_start}, "session_id": {"$ne": ""}}},
        {"$group": {"_id": "$session_id", "pages": {"$sum": 1}}},
        {"$group": {"_id": None, "avg_pages": {"$avg": "$pages"}, "total_sessions": {"$sum": 1}}}
    ]
    result = await db.page_views.aggregate(pipeline).to_list(1)
    return {
        "avgPagesPerSession": round(result[0]["avg_pages"], 1) if result else 0,
        "totalSessions": result[0]["total_sessions"] if result else 0,
    }


async def _fetch_live_activity() -> dict:
    one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    return {
        "viewsLastHour": await db.page_views.count_documents({"timestamp": {"$gte": one_hour_ago}}),
        "visitorsLastHour": len(await db.page_views.distinct("visitor_id", {"timestamp": {"$gte": one_hour_ago}})),
    }


# ── Main analytics endpoint ───────────────────────────────────────


@router.get("/admin/site-analytics")
async def get_site_analytics(days: int = 30, _auth: bool = Depends(require_admin)) -> dict:
    """Comprehensive site analytics for the admin dashboard."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_start = (now - timedelta(days=7)).isoformat()
    month_start = (now - timedelta(days=30)).isoformat()
    range_start = (now - timedelta(days=days)).isoformat()

    overview = await _fetch_overview(today_start, week_start, month_start)
    daily_trend = await _fetch_daily_trend(range_start, days)
    top_pages = await _fetch_top_pages(range_start)
    peak_hours = await _fetch_peak_hours(range_start)
    visitor_types = await _fetch_visitor_types()
    top_referrers = await _fetch_top_referrers(range_start)
    sessions = await _fetch_session_stats(range_start)
    live = await _fetch_live_activity()

    return {
        "overview": overview,
        "live": live,
        "dailyTrend": daily_trend,
        "topPages": top_pages,
        "peakHours": peak_hours,
        "dayOfWeek": _compute_day_of_week(daily_trend),
        "visitorTypes": visitor_types,
        "topReferrers": top_referrers,
        "sessions": sessions,
    }


# ── Geo analytics endpoint ────────────────────────────────────────


@router.get("/admin/site-analytics/geo")
async def get_geo_analytics(_auth: bool = Depends(require_admin)) -> dict:
    """Geographic analytics: country & city breakdown of visitors."""
    ninety_days_ago = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()

    ip_stats = await db.page_views.aggregate([
        {"$match": {"ip_hash": {"$exists": True, "$ne": ""}, "timestamp": {"$gte": ninety_days_ago}}},
        {"$group": {"_id": "$ip_hash", "views": {"$sum": 1}, "visitors": {"$addToSet": "$visitor_id"}}},
        {"$project": {"_id": 1, "views": 1, "visitors": {"$size": "$visitors"}}},
        {"$limit": 5000}
    ]).to_list(5000)
    ip_map: dict[str, dict] = {s["_id"]: s for s in ip_stats}

    ip_hashes = list(ip_map.keys())[:1000]
    geo_entries: list[dict] = await db.geo_cache.find(
        {"ip_hash": {"$in": ip_hashes}}, {"_id": 0}
    ).to_list(1000)

    country_agg: dict[str, dict] = {}
    city_agg: dict[str, dict] = {}
    markers: list[dict] = []

    for geo in geo_entries:
        stats = ip_map.get(geo["ip_hash"], {"views": 0, "visitors": 0})
        cc = geo.get("countryCode", "")
        country = geo.get("country", "Unknown")
        city = geo.get("city", "")
        lat, lon = geo.get("lat", 0), geo.get("lon", 0)

        if cc:
            if cc not in country_agg:
                country_agg[cc] = {"country": country, "countryCode": cc, "views": 0, "visitors": 0}
            country_agg[cc]["views"] += stats["views"]
            country_agg[cc]["visitors"] += stats["visitors"]

        if city and cc:
            city_key = f"{city},{cc}"
            if city_key not in city_agg:
                city_agg[city_key] = {"city": city, "country": country, "countryCode": cc, "lat": lat, "lon": lon, "views": 0, "visitors": 0}
            city_agg[city_key]["views"] += stats["views"]
            city_agg[city_key]["visitors"] += stats["visitors"]

        if lat and lon:
            markers.append({"lat": lat, "lon": lon, "city": city, "country": country, "views": stats["views"]})

    return {
        "countries": sorted(country_agg.values(), key=lambda x: x["views"], reverse=True),
        "cities": sorted(city_agg.values(), key=lambda x: x["views"], reverse=True)[:20],
        "markers": markers,
        "resolved": len(geo_entries),
        "totalIPs": len(ip_hashes),
    }
