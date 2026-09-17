from fastapi import APIRouter, Request
from fastapi.responses import Response
from datetime import datetime, timezone

from database import db

router = APIRouter()


@router.get("/sitemap.xml")
async def sitemap(request: Request):
    """Generate dynamic sitemap.xml for SEO."""
    base_url = str(request.base_url).rstrip('/')
    frontend_url = base_url.rsplit('/api', 1)[0] if '/api' in base_url else base_url

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    static_pages = [
        ('/', '1.0', 'daily'),
        ('/categories', '0.7', 'weekly'),
        ('/tags', '0.7', 'weekly'),
        ('/about', '0.6', 'monthly'),
        ('/contact', '0.5', 'monthly'),
    ]

    for path, priority, changefreq in static_pages:
        xml_content.append(f'''  <url>
    <loc>{frontend_url}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>''')

    poems = await db.poems.find({}, {"_id": 0, "slug": 1, "createdAt": 1}).to_list(10000)
    for poem in poems:
        created = poem.get('createdAt', today)
        if isinstance(created, datetime):
            created = created.strftime('%Y-%m-%d')
        elif isinstance(created, str) and 'T' in created:
            created = created.split('T')[0]

        xml_content.append(f'''  <url>
    <loc>{frontend_url}/poem/{poem["slug"]}</loc>
    <lastmod>{created}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>''')

    categories_pipeline = [
        {"$unwind": "$categories"},
        {"$group": {"_id": "$categories"}}
    ]
    categories = await db.poems.aggregate(categories_pipeline).to_list(1000)
    for cat in categories:
        xml_content.append(f'''  <url>
    <loc>{frontend_url}/category/{cat["_id"]}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>''')

    tags_pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags"}}
    ]
    tags = await db.poems.aggregate(tags_pipeline).to_list(1000)
    for tag in tags:
        xml_content.append(f'''  <url>
    <loc>{frontend_url}/tag/{tag["_id"]}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>''')

    xml_content.append('</urlset>')

    return Response(
        content='\n'.join(xml_content),
        media_type='application/xml'
    )


@router.get("/robots.txt")
async def robots(request: Request):
    """Generate robots.txt for search engines."""
    base_url = str(request.base_url).rstrip('/')
    frontend_url = base_url.rsplit('/api', 1)[0] if '/api' in base_url else base_url

    content = f"""User-agent: *
Allow: /

# Sitemap location
Sitemap: {frontend_url}/api/sitemap.xml

# Disallow admin pages from indexing
Disallow: /admin
Disallow: /admin/
"""
    return Response(content=content, media_type='text/plain')
