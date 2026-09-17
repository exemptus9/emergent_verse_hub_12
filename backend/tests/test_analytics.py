"""
Test Analytics API Endpoints
Tests page view tracking and site analytics for admin dashboard
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '') or 'http://localhost:8001'
BASE_URL = BASE_URL.rstrip('/')

class TestAnalyticsTrackEndpoint:
    """Tests for POST /api/analytics/track endpoint"""
    
    def test_track_page_view_success(self):
        """Should successfully record a page view with all fields"""
        payload = {
            "visitor_id": f"TEST_analytics_visitor_{int(time.time())}",
            "path": "/test/page",
            "referrer": "https://google.com",
            "session_id": f"TEST_session_{int(time.time())}"
        }
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") is True
    
    def test_track_page_view_minimal(self):
        """Should accept minimal payload (only visitor_id and path)"""
        payload = {
            "visitor_id": f"TEST_minimal_{int(time.time())}",
            "path": "/minimal-page"
        }
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") is True
    
    def test_track_page_view_with_empty_referrer(self):
        """Should accept empty referrer string"""
        payload = {
            "visitor_id": f"TEST_empty_ref_{int(time.time())}",
            "path": "/empty-ref-page",
            "referrer": "",
            "session_id": "some-session"
        }
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") is True
    
    def test_track_page_view_missing_visitor_id(self):
        """Should fail without visitor_id"""
        payload = {
            "path": "/no-visitor"
        }
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        
        assert response.status_code == 422  # Validation error
    
    def test_track_page_view_missing_path(self):
        """Should fail without path"""
        payload = {
            "visitor_id": "some-visitor"
        }
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        
        assert response.status_code == 422  # Validation error
    
    def test_track_page_view_get_not_allowed(self):
        """GET method should not be allowed"""
        response = requests.get(f"{BASE_URL}/api/analytics/track")
        
        assert response.status_code == 405  # Method Not Allowed


class TestSiteAnalyticsEndpoint:
    """Tests for GET /api/admin/site-analytics endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "idunno_admin_pass"}
        )
        assert response.status_code == 200
        return response.json().get("token")
    
    def test_site_analytics_requires_auth(self):
        """Should return 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/site-analytics")
        
        assert response.status_code == 401
        data = response.json()
        assert "Admin authentication required" in data.get("detail", "")
    
    def test_site_analytics_with_invalid_token(self):
        """Should return 401 with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": "Bearer invalid_token_123"}
        )
        
        assert response.status_code == 401
    
    def test_site_analytics_default_range(self, admin_token):
        """Should return analytics with default 30-day range"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify overview structure
        assert "overview" in data
        overview = data["overview"]
        assert "totalViews" in overview
        assert "todayViews" in overview
        assert "weekViews" in overview
        assert "monthViews" in overview
        assert "totalUnique" in overview
        assert "todayUnique" in overview
        assert "weekUnique" in overview
        assert "monthUnique" in overview
        
        # Verify live structure
        assert "live" in data
        live = data["live"]
        assert "viewsLastHour" in live
        assert "visitorsLastHour" in live
        
        # Verify other sections exist
        assert "dailyTrend" in data
        assert "topPages" in data
        assert "peakHours" in data
        assert "dayOfWeek" in data
        assert "visitorTypes" in data
        assert "topReferrers" in data
        assert "sessions" in data
    
    def test_site_analytics_7_day_range(self, admin_token):
        """Should return analytics for 7-day range"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics?days=7",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Daily trend should have at most 8 days of data (7+1 for partial day)
        assert "dailyTrend" in data
        assert len(data["dailyTrend"]) <= 8
    
    def test_site_analytics_14_day_range(self, admin_token):
        """Should return analytics for 14-day range"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics?days=14",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Daily trend should have at most 15 days of data
        assert len(data["dailyTrend"]) <= 15
    
    def test_site_analytics_90_day_range(self, admin_token):
        """Should return analytics for 90-day range"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics?days=90",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Daily trend should have at most 91 days of data
        assert len(data["dailyTrend"]) <= 91
    
    def test_site_analytics_data_types(self, admin_token):
        """Verify correct data types in response"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Overview values should be integers
        overview = data["overview"]
        assert isinstance(overview["totalViews"], int)
        assert isinstance(overview["totalUnique"], int)
        
        # Daily trend items should have date, views, visitors
        if data["dailyTrend"]:
            trend_item = data["dailyTrend"][0]
            assert "date" in trend_item
            assert "views" in trend_item
            assert "visitors" in trend_item
            assert isinstance(trend_item["views"], int)
            assert isinstance(trend_item["visitors"], int)
        
        # Top pages items should have path, views, visitors
        if data["topPages"]:
            page_item = data["topPages"][0]
            assert "path" in page_item
            assert "views" in page_item
            assert "visitors" in page_item
        
        # Peak hours items should have hour (int), views (int)
        if data["peakHours"]:
            hour_item = data["peakHours"][0]
            assert "hour" in hour_item
            assert "views" in hour_item
            assert isinstance(hour_item["hour"], int)
            assert 0 <= hour_item["hour"] <= 23
        
        # Day of week should have 7 items
        assert len(data["dayOfWeek"]) == 7
        for dow in data["dayOfWeek"]:
            assert "day" in dow
            assert "views" in dow
            assert dow["day"] in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        # Visitor types
        visitor_types = data["visitorTypes"]
        assert "new" in visitor_types
        assert "returning" in visitor_types
        assert isinstance(visitor_types["new"], int)
        assert isinstance(visitor_types["returning"], int)
        
        # Sessions
        sessions = data["sessions"]
        assert "avgPagesPerSession" in sessions
        assert "totalSessions" in sessions
    
    def test_site_analytics_top_pages_limit(self, admin_token):
        """Top pages should be limited to 15 items"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["topPages"]) <= 15
    
    def test_site_analytics_top_referrers_limit(self, admin_token):
        """Top referrers should be limited to 10 items"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["topReferrers"]) <= 10


class TestPageViewTracking:
    """Integration tests to verify page views are being recorded"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "idunno_admin_pass"}
        )
        return response.json().get("token")
    
    def test_track_view_and_verify_in_analytics(self, admin_token):
        """Track a view and verify it appears in analytics"""
        # Get initial count
        response1 = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        initial_total = response1.json()["overview"]["totalViews"]
        
        # Track a new page view
        unique_path = f"/test/integration/{int(time.time())}"
        payload = {
            "visitor_id": f"TEST_integration_{int(time.time())}",
            "path": unique_path,
            "referrer": "https://test.com",
            "session_id": f"TEST_session_{int(time.time())}"
        }
        track_response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        assert track_response.status_code == 200
        
        # Verify count increased
        response2 = requests.get(
            f"{BASE_URL}/api/admin/site-analytics",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        new_total = response2.json()["overview"]["totalViews"]
        
        assert new_total == initial_total + 1


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
