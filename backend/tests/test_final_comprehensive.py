"""
Final Comprehensive Backend API Tests
Tests all endpoints before production deployment
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '') or 'http://localhost:8001'
BASE_URL = BASE_URL.rstrip('/')

# ==================== FIXTURES ====================

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/admin/login", json={
        "password": "idunno_admin_pass"
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("token")
    pytest.skip("Admin authentication failed")


@pytest.fixture(scope="session")
def authenticated_client(api_client, admin_token):
    """Session with admin auth header"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client


# ==================== ROOT & HEALTH ====================

class TestRootEndpoints:
    """Test root API endpoints"""

    def test_root_endpoint(self, api_client):
        """Test root API returns proper message"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"Root endpoint: {data['message']}")


# ==================== POEMS API ====================

class TestPoemsAPI:
    """Test poems CRUD and related endpoints"""

    def test_get_all_poems(self, api_client):
        """Test fetching all poems with default sort"""
        response = api_client.get(f"{BASE_URL}/api/poems")
        assert response.status_code == 200
        data = response.json()
        assert "poems" in data
        assert len(data["poems"]) > 0
        print(f"Total poems: {len(data['poems'])}")

    def test_get_poems_sorted(self, api_client):
        """Test sorting poems by various fields"""
        sort_options = ["newest", "oldest", "rating-high", "rating-low", "most-rated", "most-viewed"]
        for sort_opt in sort_options:
            response = api_client.get(f"{BASE_URL}/api/poems?sort={sort_opt}")
            assert response.status_code == 200, f"Sort by {sort_opt} failed"
        print("All sort options working")

    def test_get_poem_by_slug(self, api_client):
        """Test fetching poem by slug"""
        # First get a poem
        poems_response = api_client.get(f"{BASE_URL}/api/poems")
        poems = poems_response.json()["poems"]
        if poems:
            slug = poems[0]["slug"]
            response = api_client.get(f"{BASE_URL}/api/poems/slug/{slug}")
            assert response.status_code == 200
            data = response.json()
            assert "poem" in data
            assert data["poem"]["slug"] == slug
            print(f"Fetched poem by slug: {data['poem']['title']}")

    def test_get_poem_by_invalid_slug(self, api_client):
        """Test 404 for non-existent slug"""
        response = api_client.get(f"{BASE_URL}/api/poems/slug/non-existent-slug-12345")
        assert response.status_code == 404

    def test_poem_of_the_day(self, api_client):
        """Test poem of the day endpoint"""
        response = api_client.get(f"{BASE_URL}/api/poem-of-the-day")
        assert response.status_code == 200
        data = response.json()
        assert "poem" in data
        assert "date" in data
        print(f"Poem of the day: {data['poem']['title']}")

    def test_random_poem(self, api_client):
        """Test random poem endpoint"""
        response = api_client.get(f"{BASE_URL}/api/random-poem")
        assert response.status_code == 200
        data = response.json()
        assert "poem" in data
        print(f"Random poem: {data['poem']['title']}")

    def test_most_viewed_poems(self, api_client):
        """Test most viewed poems endpoint"""
        response = api_client.get(f"{BASE_URL}/api/poems/most-viewed?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert "poems" in data
        print(f"Most viewed poems count: {len(data['poems'])}")

    def test_get_poems_by_category(self, api_client):
        """Test filtering poems by category"""
        response = api_client.get(f"{BASE_URL}/api/poems?category=Introspection")
        assert response.status_code == 200
        data = response.json()
        assert "poems" in data
        print(f"Poems in Introspection category: {len(data['poems'])}")

    def test_get_poems_by_tag(self, api_client):
        """Test filtering poems by tag"""
        response = api_client.get(f"{BASE_URL}/api/poems?tag=life")
        assert response.status_code == 200
        data = response.json()
        assert "poems" in data
        print(f"Poems with 'life' tag: {len(data['poems'])}")


# ==================== RATING API ====================

class TestRatingAPI:
    """Test poem rating functionality"""

    def test_get_rating_status(self, api_client):
        """Test checking rating status for a poem"""
        poems_response = api_client.get(f"{BASE_URL}/api/poems")
        poems = poems_response.json()["poems"]
        if poems:
            poem_id = poems[0]["id"]
            response = api_client.get(f"{BASE_URL}/api/poems/{poem_id}/rating-status")
            assert response.status_code == 200
            data = response.json()
            assert "hasRated" in data
            print(f"Rating status for poem: hasRated={data['hasRated']}")


# ==================== COMMENTS API ====================

class TestCommentsAPI:
    """Test comments functionality"""

    def test_get_poem_comments(self, api_client):
        """Test fetching comments for a poem"""
        poems_response = api_client.get(f"{BASE_URL}/api/poems")
        poems = poems_response.json()["poems"]
        if poems:
            poem_id = poems[0]["id"]
            response = api_client.get(f"{BASE_URL}/api/poems/{poem_id}/comments")
            assert response.status_code == 200
            data = response.json()
            assert "comments" in data
            print(f"Comments count: {len(data['comments'])}")

    def test_add_comment(self, api_client):
        """Test adding a comment (pending approval)"""
        poems_response = api_client.get(f"{BASE_URL}/api/poems")
        poems = poems_response.json()["poems"]
        if poems:
            poem_id = poems[0]["id"]
            unique_content = f"TEST_comment_{uuid.uuid4().hex[:8]}"
            response = api_client.post(f"{BASE_URL}/api/poems/{poem_id}/comments", json={
                "author": "TEST_User",
                "content": unique_content
            })
            assert response.status_code == 200
            data = response.json()
            assert "comment" in data
            assert "message" in data
            assert data["comment"]["content"] == unique_content
            print(f"Comment submitted: {data['message']}")


# ==================== TAXONOMY API ====================

class TestTaxonomyAPI:
    """Test categories and tags endpoints"""

    def test_get_categories(self, api_client):
        """Test fetching all categories with counts"""
        response = api_client.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) > 0
        # Verify structure
        cat = data["categories"][0]
        assert "name" in cat
        assert "count" in cat
        print(f"Categories count: {len(data['categories'])}")

    def test_get_tags(self, api_client):
        """Test fetching all tags with counts"""
        response = api_client.get(f"{BASE_URL}/api/tags")
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert len(data["tags"]) > 0
        # Verify structure
        tag = data["tags"][0]
        assert "name" in tag
        assert "count" in tag
        print(f"Tags count: {len(data['tags'])}")


# ==================== NEWSLETTER API ====================

class TestNewsletterAPI:
    """Test newsletter subscription endpoints"""

    def test_newsletter_subscribe_invalid_email(self, api_client):
        """Test subscription with invalid email format"""
        response = api_client.post(f"{BASE_URL}/api/newsletter/subscribe", json={
            "email": "invalid-email"
        })
        assert response.status_code == 400

    def test_newsletter_subscribe_valid(self, api_client):
        """Test valid newsletter subscription"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = api_client.post(f"{BASE_URL}/api/newsletter/subscribe", json={
            "email": unique_email
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        print(f"Newsletter subscription: {data['message']}")

    def test_newsletter_unsubscribe(self, api_client):
        """Test newsletter unsubscription"""
        # First subscribe
        unique_email = f"test_unsub_{uuid.uuid4().hex[:8]}@example.com"
        api_client.post(f"{BASE_URL}/api/newsletter/subscribe", json={
            "email": unique_email
        })
        # Then unsubscribe
        response = api_client.post(f"{BASE_URL}/api/newsletter/unsubscribe", json={
            "email": unique_email
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        print("Newsletter unsubscription successful")


# ==================== SEO ENDPOINTS ====================

class TestSEOEndpoints:
    """Test SEO-related endpoints"""

    def test_sitemap_xml(self, api_client):
        """Test sitemap.xml returns valid XML"""
        response = api_client.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200
        assert "application/xml" in response.headers.get("content-type", "")
        content = response.text
        assert '<?xml version="1.0"' in content
        assert '<urlset' in content
        assert '</urlset>' in content
        print("Sitemap XML is valid")

    def test_robots_txt(self, api_client):
        """Test robots.txt returns valid content"""
        response = api_client.get(f"{BASE_URL}/api/robots.txt")
        assert response.status_code == 200
        content = response.text
        assert "User-agent:" in content
        assert "Sitemap:" in content
        assert "Disallow: /admin" in content
        print("Robots.txt is valid")


# ==================== ADMIN AUTH ====================

class TestAdminAuth:
    """Test admin authentication endpoints"""

    def test_admin_login_invalid_password(self, api_client):
        """Test login with wrong password"""
        response = api_client.post(f"{BASE_URL}/api/admin/login", json={
            "password": "wrong_password"
        })
        assert response.status_code == 401

    def test_admin_login_valid_password(self, api_client):
        """Test login with correct password"""
        response = api_client.post(f"{BASE_URL}/api/admin/login", json={
            "password": "idunno_admin_pass"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        print("Admin login successful")


# ==================== ADMIN STATS & ANALYTICS ====================

class TestAdminStats:
    """Test admin statistics and analytics endpoints"""

    def test_admin_stats(self, authenticated_client):
        """Test admin dashboard stats"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "poemsCount" in data
        assert "commentsCount" in data
        assert "ratingsCount" in data
        assert "subscribersCount" in data
        assert "totalViews" in data
        print(f"Stats: {data['poemsCount']} poems, {data['commentsCount']} comments, {data['totalViews']} views")

    def test_admin_analytics(self, authenticated_client):
        """Test admin analytics endpoint"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/analytics")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "mostViewed" in data
        assert "topRated" in data
        assert "categoryStats" in data
        assert "tagStats" in data
        print(f"Analytics loaded: {data['summary']['totalPoems']} poems, {data['summary']['totalViews']} views")


# ==================== ADMIN COMMENTS MODERATION ====================

class TestAdminComments:
    """Test admin comment moderation endpoints"""

    def test_get_all_comments(self, authenticated_client):
        """Test fetching all comments"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/all-comments")
        assert response.status_code == 200
        data = response.json()
        assert "comments" in data
        print(f"Total comments: {len(data['comments'])}")

    def test_get_pending_comments(self, authenticated_client):
        """Test fetching pending comments"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/pending-comments")
        assert response.status_code == 200
        data = response.json()
        assert "comments" in data
        print(f"Pending comments: {len(data['comments'])}")


# ==================== ADMIN NOTIFICATIONS ====================

class TestAdminNotifications:
    """Test admin notifications endpoints"""

    def test_get_notifications(self, authenticated_client):
        """Test fetching notifications"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/notifications")
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        assert "unreadCount" in data
        print(f"Notifications: {len(data['notifications'])}, unread: {data['unreadCount']}")

    def test_mark_all_notifications_read(self, authenticated_client):
        """Test marking all notifications as read"""
        response = authenticated_client.post(f"{BASE_URL}/api/admin/notifications/read-all")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        print(f"Marked {data.get('count', 0)} notifications as read")


# ==================== ADMIN SUBSCRIBERS ====================

class TestAdminSubscribers:
    """Test admin subscriber management"""

    def test_get_subscribers(self, authenticated_client):
        """Test fetching newsletter subscribers"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/subscribers")
        assert response.status_code == 200
        data = response.json()
        assert "subscribers" in data
        assert "count" in data
        print(f"Subscribers: {data['count']}")

    def test_email_status(self, authenticated_client):
        """Test email service status"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/email-status")
        assert response.status_code == 200
        data = response.json()
        assert "configured" in data
        print(f"Email configured: {data['configured']}")


# ==================== ADMIN EXPORTS ====================

class TestAdminExports:
    """Test admin export endpoints"""

    def test_export_poems_json(self, authenticated_client):
        """Test exporting poems as JSON"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/export/poems/json")
        assert response.status_code == 200
        data = response.json()
        assert "poems" in data
        assert "count" in data
        assert "exportedAt" in data
        print(f"JSON export: {data['count']} poems")

    def test_export_poems_csv(self, authenticated_client):
        """Test exporting poems as CSV"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/export/poems/csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        content = response.text
        assert "id,title,slug" in content
        print("CSV export successful")

    def test_export_subscribers_csv(self, authenticated_client):
        """Test exporting subscribers as CSV"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/export/subscribers/csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        print("Subscribers CSV export successful")

    def test_export_poems_pdf(self, authenticated_client):
        """Test exporting poems as PDF"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/export/poems/pdf")
        assert response.status_code == 200
        assert "application/pdf" in response.headers.get("content-type", "")
        print("PDF export successful")


# ==================== ADMIN POEM CRUD ====================

class TestAdminPoemCRUD:
    """Test admin poem management"""

    def test_get_poem_by_id(self, authenticated_client, api_client):
        """Test fetching poem by ID for editing"""
        # First get a poem ID
        poems_response = api_client.get(f"{BASE_URL}/api/poems")
        poems = poems_response.json()["poems"]
        if poems:
            poem_id = poems[0]["id"]
            response = authenticated_client.get(f"{BASE_URL}/api/admin/poems/{poem_id}")
            assert response.status_code == 200
            data = response.json()
            assert "poem" in data
            print(f"Admin fetched poem: {data['poem']['title']}")

    def test_create_and_update_poem(self, authenticated_client):
        """Test creating and updating a poem"""
        unique_slug = f"test-poem-{uuid.uuid4().hex[:8]}"
        
        # Create poem
        create_response = authenticated_client.post(f"{BASE_URL}/api/poems", json={
            "title": "TEST Poem Title",
            "slug": unique_slug,
            "content": "Test content\nLine 2\nLine 3",
            "categories": ["Test Category"],
            "tags": ["test", "automated"],
            "author": "TEST Author",
            "date": "January 1, 2026"
        })
        assert create_response.status_code == 200
        created_poem = create_response.json()
        poem_id = created_poem["id"]
        print(f"Created poem: {created_poem['title']}")

        # Update poem
        update_response = authenticated_client.put(f"{BASE_URL}/api/admin/poems/{poem_id}", json={
            "title": "TEST Updated Poem Title"
        })
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["poem"]["title"] == "TEST Updated Poem Title"
        print(f"Updated poem title: {updated['poem']['title']}")

        # Delete poem
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/admin/poems/{poem_id}")
        assert delete_response.status_code == 200
        print("Poem deleted successfully")


# ==================== NEWSLETTER LOGS ====================

class TestNewsletterLogs:
    """Test newsletter send logs"""

    def test_get_newsletter_logs(self, authenticated_client):
        """Test fetching newsletter send logs"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/newsletter/logs")
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        print(f"Newsletter logs: {len(data['logs'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
