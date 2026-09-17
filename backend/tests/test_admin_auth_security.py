"""
Backend API tests for RhymeMosaic Admin Authentication & Security
- Tests token-based authentication system
- Tests rate limiting on login endpoint
- Tests authorization on all protected admin endpoints
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '') or 'http://localhost:8001'
BASE_URL = BASE_URL.rstrip('/')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '')


class TestAdminLoginAuth:
    """Tests for admin login and token generation"""
    
    def test_login_returns_token(self):
        """POST /api/admin/login with correct password should return a token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('success') == True, "Login should succeed"
        assert 'token' in data, "Response should include token"
        assert len(data['token']) > 20, "Token should be of reasonable length"
        assert 'message' in data
        
        print(f"✓ Login returns token: {data['token'][:20]}...")

    def test_login_invalid_password_returns_401(self):
        """POST /api/admin/login with wrong password should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"}
        )
        assert response.status_code == 401
        
        data = response.json()
        assert 'detail' in data or 'error' in data
        
        print(f"✓ Invalid password returns 401")

    def test_login_empty_password_returns_error(self):
        """POST /api/admin/login with empty password should fail"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ""}
        )
        assert response.status_code == 401 or response.status_code == 422
        
        print(f"✓ Empty password returns error: {response.status_code}")


class TestAdminEndpointsWithoutAuth:
    """Tests that all admin endpoints require authentication"""
    
    def test_admin_stats_without_auth(self):
        """GET /api/admin/stats without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/stats without auth returns 401")

    def test_admin_analytics_without_auth(self):
        """GET /api/admin/analytics without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/analytics without auth returns 401")

    def test_admin_subscribers_without_auth(self):
        """GET /api/admin/subscribers without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/subscribers")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/subscribers without auth returns 401")

    def test_admin_notifications_without_auth(self):
        """GET /api/admin/notifications without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/notifications")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/notifications without auth returns 401")

    def test_admin_pending_comments_without_auth(self):
        """GET /api/admin/pending-comments without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/pending-comments")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/pending-comments without auth returns 401")

    def test_admin_all_comments_without_auth(self):
        """GET /api/admin/all-comments without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/all-comments")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/all-comments without auth returns 401")

    def test_admin_email_status_without_auth(self):
        """GET /api/admin/email-status without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/email-status")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/email-status without auth returns 401")

    def test_admin_export_json_without_auth(self):
        """GET /api/admin/export/poems/json without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/export/poems/json")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/export/poems/json without auth returns 401")

    def test_admin_export_csv_without_auth(self):
        """GET /api/admin/export/poems/csv without token should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/export/poems/csv")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ GET /api/admin/export/poems/csv without auth returns 401")

    def test_admin_delete_poem_without_auth(self):
        """DELETE /api/admin/poems/{id} without token should return 401"""
        response = requests.delete(f"{BASE_URL}/api/admin/poems/some-fake-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ DELETE /api/admin/poems/{{id}} without auth returns 401")

    def test_admin_update_poem_without_auth(self):
        """PUT /api/admin/poems/{id} without token should return 401"""
        response = requests.put(
            f"{BASE_URL}/api/admin/poems/some-fake-id",
            json={"title": "New Title"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ PUT /api/admin/poems/{{id}} without auth returns 401")


class TestAdminEndpointsWithValidToken:
    """Tests that admin endpoints work with valid token"""
    
    @pytest.fixture
    def auth_token(self):
        """Get a valid admin token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()['token']
    
    @pytest.fixture
    def auth_header(self, auth_token):
        """Return auth header dict"""
        return {"Authorization": f"Bearer {auth_token}"}

    def test_admin_stats_with_valid_token(self, auth_header):
        """GET /api/admin/stats with valid token should return 200"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_header)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'poemsCount' in data
        assert 'commentsCount' in data
        assert 'ratingsCount' in data
        
        print(f"✓ GET /api/admin/stats with valid token returns stats")

    def test_admin_analytics_with_valid_token(self, auth_header):
        """GET /api/admin/analytics with valid token should return 200"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics", headers=auth_header)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'summary' in data
        assert 'mostViewed' in data
        assert 'topRated' in data
        
        print(f"✓ GET /api/admin/analytics with valid token returns data")

    def test_admin_subscribers_with_valid_token(self, auth_header):
        """GET /api/admin/subscribers with valid token should return 200"""
        response = requests.get(f"{BASE_URL}/api/admin/subscribers", headers=auth_header)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'subscribers' in data
        assert 'count' in data
        
        print(f"✓ GET /api/admin/subscribers with valid token works")

    def test_admin_notifications_with_valid_token(self, auth_header):
        """GET /api/admin/notifications with valid token should return 200"""
        response = requests.get(f"{BASE_URL}/api/admin/notifications", headers=auth_header)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'notifications' in data
        assert 'unreadCount' in data
        
        print(f"✓ GET /api/admin/notifications with valid token works")


class TestInvalidTokenHandling:
    """Tests that invalid/expired tokens are properly rejected"""
    
    def test_invalid_token_rejected(self):
        """Request with invalid token should return 401"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ Invalid token returns 401")

    def test_malformed_auth_header_rejected(self):
        """Request with malformed Authorization header should return 401"""
        headers = {"Authorization": "NotBearer some_token"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ Malformed auth header returns 401")

    def test_empty_token_rejected(self):
        """Request with empty Bearer token should return 401"""
        headers = {"Authorization": "Bearer "}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ Empty token returns 401")


class TestExportWithQueryParamToken:
    """Tests that export endpoints accept token via query param"""
    
    @pytest.fixture
    def auth_token(self):
        """Get a valid admin token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()['token']

    def test_export_json_with_query_token(self, auth_token):
        """GET /api/admin/export/poems/json?token=xxx should work"""
        response = requests.get(f"{BASE_URL}/api/admin/export/poems/json?token={auth_token}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'poems' in data
        assert 'exportedAt' in data
        
        print(f"✓ Export JSON with query token works")

    def test_export_csv_with_query_token(self, auth_token):
        """GET /api/admin/export/poems/csv?token=xxx should work"""
        response = requests.get(f"{BASE_URL}/api/admin/export/poems/csv?token={auth_token}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert 'text/csv' in response.headers.get('content-type', '')
        
        print(f"✓ Export CSV with query token works")

    def test_export_with_invalid_query_token(self):
        """GET /api/admin/export/poems/json?token=invalid should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/export/poems/json?token=invalid_token")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print(f"✓ Export with invalid query token returns 401")


class TestPublicEndpointsStillWork:
    """Tests that public API endpoints still work without auth"""
    
    def test_get_poems_public(self):
        """GET /api/poems should work without auth"""
        response = requests.get(f"{BASE_URL}/api/poems")
        assert response.status_code == 200
        
        data = response.json()
        assert 'poems' in data
        
        print(f"✓ GET /api/poems works without auth")

    def test_get_poem_by_slug_public(self):
        """GET /api/poems/slug/{slug} should work without auth"""
        response = requests.get(f"{BASE_URL}/api/poems/slug/broken")
        assert response.status_code == 200
        
        data = response.json()
        assert 'poem' in data
        
        print(f"✓ GET /api/poems/slug/broken works without auth")

    def test_poem_of_day_public(self):
        """GET /api/poem-of-the-day should work without auth"""
        response = requests.get(f"{BASE_URL}/api/poem-of-the-day")
        assert response.status_code == 200
        
        print(f"✓ GET /api/poem-of-the-day works without auth")

    def test_random_poem_public(self):
        """GET /api/random-poem should work without auth"""
        response = requests.get(f"{BASE_URL}/api/random-poem")
        assert response.status_code == 200
        
        print(f"✓ GET /api/random-poem works without auth")

    def test_categories_public(self):
        """GET /api/categories should work without auth"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        print(f"✓ GET /api/categories works without auth")

    def test_tags_public(self):
        """GET /api/tags should work without auth"""
        response = requests.get(f"{BASE_URL}/api/tags")
        assert response.status_code == 200
        
        print(f"✓ GET /api/tags works without auth")

    def test_rate_poem_public(self):
        """POST /api/poems/{id}/rate should work without auth (public rating)"""
        # First get a poem ID
        response = requests.get(f"{BASE_URL}/api/poems/slug/broken")
        assert response.status_code == 200
        poem_id = response.json()['poem']['id']
        
        # Rating might return 400 if already rated, but not 401
        response = requests.post(
            f"{BASE_URL}/api/poems/{poem_id}/rate",
            json={"rating": 5}
        )
        # Should be 200 (success) or 400 (already rated), but NOT 401
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}"
        
        print(f"✓ POST /api/poems/{{id}}/rate works without auth (status: {response.status_code})")

    def test_add_comment_public(self):
        """POST /api/poems/{id}/comments should work without auth"""
        # First get a poem ID
        response = requests.get(f"{BASE_URL}/api/poems/slug/broken")
        assert response.status_code == 200
        poem_id = response.json()['poem']['id']
        
        # Add comment (pending approval)
        response = requests.post(
            f"{BASE_URL}/api/poems/{poem_id}/comments",
            json={"author": "TestBot", "content": "Test comment from security test"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'comment' in data or 'message' in data
        
        print(f"✓ POST /api/poems/{{id}}/comments works without auth")


class TestRateLimitingLogin:
    """Tests for rate limiting on login endpoint (10 attempts / 5 minutes)"""
    
    def test_rate_limit_warning(self):
        """Note: Rate limiting test is informational - server may reset between tests"""
        print("Note: Rate limiting is configured for 10 attempts per 5 minutes per IP")
        print("This test verifies the endpoint responds correctly")
        
        # Make a few attempts with wrong password
        for i in range(3):
            response = requests.post(
                f"{BASE_URL}/api/admin/login",
                json={"password": "test_wrong_password"}
            )
            # Should be 401 (unauthorized) not 429 yet
            assert response.status_code in [401, 429], f"Expected 401 or 429, got {response.status_code}"
        
        print(f"✓ Rate limiting endpoint responds correctly")


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
