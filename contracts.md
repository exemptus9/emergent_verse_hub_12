# IDunnoPoetry API Contracts

## Overview
This document captures the API contracts for the IDunnoPoetry poetry website clone.

## Data Models

### Poem
```json
{
  "id": "string (MongoDB ObjectId)",
  "title": "string",
  "slug": "string (unique)",
  "content": "string",
  "categories": ["string"],
  "tags": ["string"],
  "date": "string (formatted date)",
  "author": "string",
  "comments": "number",
  "rating": "number (0-5)",
  "ratingCount": "number",
  "totalRatingSum": "number",
  "isAnnouncement": "boolean (optional)",
  "amazonLink": "string (optional)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Rating
```json
{
  "id": "string",
  "poemId": "string",
  "visitorId": "string (IP hash or fingerprint)",
  "rating": "number (1-5)",
  "createdAt": "datetime"
}
```

### Comment
```json
{
  "id": "string",
  "poemId": "string",
  "author": "string",
  "content": "string",
  "createdAt": "datetime"
}
```

## API Endpoints

### Poems

#### GET /api/poems
Get all poems with optional sorting
- Query params: `sort` (newest, oldest, rating-high, rating-low, most-rated)
- Response: `{ poems: Poem[] }`

#### GET /api/poems/:slug
Get single poem by slug
- Response: `{ poem: Poem }`

#### GET /api/poems/category/:category
Get poems by category
- Response: `{ poems: Poem[] }`

#### GET /api/poems/tag/:tag  
Get poems by tag
- Response: `{ poems: Poem[] }`

### Ratings

#### POST /api/poems/:poemId/rate
Submit a rating for a poem
- Body: `{ rating: number (1-5) }`
- Headers: Visitor identification via IP
- Response: `{ success: boolean, newRating: number, ratingCount: number }`
- Prevents duplicate votes per visitor

#### GET /api/poems/:poemId/rating-status
Check if visitor has already rated
- Response: `{ hasRated: boolean, userRating?: number }`

### Comments

#### GET /api/poems/:poemId/comments
Get comments for a poem
- Response: `{ comments: Comment[] }`

#### POST /api/poems/:poemId/comments
Add a comment
- Body: `{ author: string, content: string }`
- Response: `{ comment: Comment }`

### Categories & Tags

#### GET /api/categories
Get all categories with poem counts
- Response: `{ categories: [{name: string, count: number}] }`

#### GET /api/tags
Get all tags with poem counts
- Response: `{ tags: [{name: string, count: number}] }`

## Mock Data to Replace
The following data in `mockPoems.js` will be replaced with real API calls:
- `poems` array → GET /api/poems
- `categories` array → GET /api/categories
- `tags` array → GET /api/tags
- Rating submission → POST /api/poems/:id/rate
- Comments → GET/POST /api/poems/:id/comments

## Frontend Integration
1. Replace static imports from mockPoems.js with API calls
2. Use React Query or useEffect for data fetching
3. Keep localStorage for optimistic UI updates on ratings
4. Sync localStorage vote status with backend visitor tracking
