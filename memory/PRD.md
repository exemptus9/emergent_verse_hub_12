# RhymeMosaic - Product Requirements Document

## Original Problem Statement
Build a feature-rich, pixel-perfect clone of the website `https://rhymemosaic.wordpress.com/`.

## Core Requirements
1. Clone of rhymemosaic.wordpress.com
2. Poem rating and sorting system
3. Comprehensive admin panel (CRUD, comment moderation, site statistics)
4. All 205 poems migrated with precise original formatting and AI auto-tagging
5. Single-vote enforcement per poem
6. Custom footer quote: "I don't fight for my survival - I write for it."
7. "Poem of the Day" and "Random Poem" features
8. "Most Viewed" poems section with view count tracking
9. Contact page with social media links and message form
10. Social media sharing buttons on poem pages
11. Password-secured admin panel with token-based authentication
12. SEO and Open Graph meta tags
13. Dynamic sitemap.xml
14. Newsletter subscription feature
15. Advanced admin analytics dashboard
16. Data export (CSV, JSON, PDF) for poems, comments, subscribers
17. In-app admin notifications for new comments
18. Email notifications (Resend) for new comments
19. Bulk email to newsletter subscribers
20. "Reading Journey" tracker (localStorage)
21. Dedicated author profile page at /about
22. AI-powered thematic tagging/categorization (Gemini Flash)
23. Dynamic tag/category clouds (size based on frequency)
24. UI polish with animations, hover effects, transitions
25. Accurate poem formatting with correct stanza breaks
26. Admin password change feature
27. Remember pagination state on All Poems page (navigate back returns to same page)

## Architecture
- **Frontend**: React + TailwindCSS + react-helmet-async
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
- **Email**: Resend SDK (requires user API key)
- **AI**: emergentintegrations (Gemini Flash) for one-time tagging
- **PDF**: reportlab

## Security Model
- **Admin Auth**: Token-based session authentication
  - Login: POST /api/admin/login returns session token (24h expiry)
  - All admin routes require `Authorization: Bearer <token>` header
  - Export download URLs accept `?token=<token>` query param
  - Rate limiting: 10 login attempts per 5 minutes per IP
  - Auto-logout on 401 via frontend interceptor
  - Sessions stored in-memory (reset on server restart)

## Key DB Schema
- **poems**: `{ id, title, slug, author, content, tags, category, createdAt, ratings, avgRating, ratingCount, viewCount }`
- **comments**: `{ id, poemId, author, body, createdAt, approved }`
- **subscribers**: `{ id, email, subscribedAt }`
- **notifications**: `{ id, type, title, referenceId, referenceType, read, createdAt }`

## What's Been Implemented (All Complete)
- Full poem browsing, searching, rating, commenting
- Secure admin panel with token-based auth, dashboard, CRUD, analytics, export, newsletter, notifications
- "Poem of the Day", "Most Viewed", "Random Poem", view counts, social sharing
- Reading Journey tracker
- All 205 poems migrated with AI-powered tagging/categorization
- Poem formatting fixed by scraping original WordPress HTML (Feb 16, 2026)
- Security hardening: token auth on all admin routes, rate limiting (Feb 16, 2026)
- Dynamic sitemap.xml, SEO/OG meta tags
- Tag/Category clouds with frequency-based sizing (shuffle bug fixed)
- Author profile page at /about
- Email integration (Resend - requires API key)
- UI polish with custom animations
- Cleaned up obsolete scripts
- Admin "Change Password" feature on /admin/settings (Feb 16, 2026)
- Pagination state preserved when navigating back from poem detail (Feb 16, 2026)
- Top pagination controls on homepage (Feb 16, 2026)
- Share button clipboard fallback on PoemCard (Feb 16, 2026)
- Bookmarks page at /bookmarks with clear-all and sidebar link (Feb 16, 2026)
- Email service configured with Resend (Feb 16, 2026)
- Contact form sends messages directly via Resend instead of mailto (Feb 16, 2026)
- Contact form rate limiting: 5 messages/hour/IP (Feb 16, 2026)
- Backend refactored from monolithic server.py to modular structure (Feb 16, 2026)
- Admin poem form: dropdown multi-select for categories/tags with create-new (Feb 16, 2026)
- Deployment health check: fixed hardcoded URLs, N+1 queries, cleaned up dead files (Feb 16, 2026)
- Final comprehensive test: 37/37 backend + all frontend = 100% pass rate (Feb 16, 2026)
- Removed admin email from all public-facing pages (AboutPage, ContactPage) (Feb 17, 2026)
- Site-wide page view & unique visitor tracking with admin analytics dashboard (Feb 17, 2026)
- Geographic visitor map with IP geolocation, world map, top countries & cities (Feb 17, 2026)
- Full rebrand from IDunnoPoetry to RhymeMosaic across all code, UI, emails, and DB (Feb 17, 2026)
- Deployment health check: fixed 6 unbounded DB queries with limits and time filters (Feb 17, 2026)
- Code quality pass: 14 findings fixed — httpOnly cookies, refactored analytics/admin/seed.py, hook deps, useMemo, removed console.log, array keys, empty catches (Feb 17, 2026)
- Fixed API path mismatches between frontend and backend routes (taxonomy, poems/slug, poem-of-the-day, random-poem, search, most-viewed) — sidebar panels now populated correctly (Feb 17, 2026)

## Upcoming Tasks
- **P1**: ~~Configure Email Service~~ (DONE - Resend configured with rhymemosaic@gmail.com)
- **P1**: Comment Reply Threads (nested comments)
- **P2**: Poem Collections/Playlists

## Future/Backlog
- **P2**: Multiple Admin Accounts

## Credentials
- Admin Password: `idunno_admin_pass` (from ADMIN_PASSWORD env var)
