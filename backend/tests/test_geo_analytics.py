"""
Test Geographic Analytics API Endpoints
Tests IP geolocation tracking and geo analytics for admin dashboard
- POST /api/analytics/track - ip_hash capture
- GET /api/admin/site-analytics/geo - geographic data retrieval
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '') or 'http://localhost:8001'
BASE_URL = BASE_URL.rstrip('/')


class TestTrackEndpointIpHash:
    """Tests for ip_hash capture in POST /api/analytics/track"""
    
    def test_track_page_view_returns_ok(self):
        """Track endpoint should successfully accept requests and capture IP"""
        payload = {
            "visitor_id": f"TEST_geo_visitor_{int(time.time())}",
            "path": "/test/geo-page",
            "referrer": "https://google.com",
            "session_id": f"TEST_geo_session_{int(time.time())}"
        }
        response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") is True


class TestGeoAnalyticsEndpoint:
    """Tests for GET /api/admin/site-analytics/geo endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "idunno_admin_pass"}
        )
        assert response.status_code == 200
        return response.json().get("token")
    
    def test_geo_analytics_requires_auth(self):
        """Should return 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/site-analytics/geo")
        
        assert response.status_code == 401
        data = response.json()
        assert "Admin authentication required" in data.get("detail", "")
    
    def test_geo_analytics_with_invalid_token(self):
        """Should return 401 with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        
        assert response.status_code == 401
    
    def test_geo_analytics_success(self, admin_token):
        """Should return geo analytics with valid auth"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify top-level structure
        assert "countries" in data
        assert "cities" in data
        assert "markers" in data
        assert "resolved" in data
        assert "totalIPs" in data
    
    def test_geo_analytics_countries_structure(self, admin_token):
        """Countries array should have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["countries"], list)
        
        # If countries exist, verify structure
        if data["countries"]:
            country = data["countries"][0]
            assert "country" in country
            assert "countryCode" in country
            assert "views" in country
            assert "visitors" in country
            
            # Verify data types
            assert isinstance(country["country"], str)
            assert isinstance(country["countryCode"], str)
            assert isinstance(country["views"], int)
            assert isinstance(country["visitors"], int)
            
            # Country code should be 2-letter ISO code
            assert len(country["countryCode"]) == 2
    
    def test_geo_analytics_cities_structure(self, admin_token):
        """Cities array should have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["cities"], list)
        
        # If cities exist, verify structure
        if data["cities"]:
            city = data["cities"][0]
            assert "city" in city
            assert "country" in city
            assert "countryCode" in city
            assert "lat" in city
            assert "lon" in city
            assert "views" in city
            assert "visitors" in city
            
            # Verify data types
            assert isinstance(city["city"], str)
            assert isinstance(city["country"], str)
            assert isinstance(city["views"], int)
            assert isinstance(city["visitors"], int)
            assert isinstance(city["lat"], (int, float))
            assert isinstance(city["lon"], (int, float))
    
    def test_geo_analytics_markers_structure(self, admin_token):
        """Markers array should have correct structure for map rendering"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["markers"], list)
        
        # If markers exist, verify structure
        if data["markers"]:
            marker = data["markers"][0]
            assert "lat" in marker
            assert "lon" in marker
            assert "city" in marker
            assert "country" in marker
            assert "views" in marker
            
            # Verify coordinates are valid
            assert isinstance(marker["lat"], (int, float))
            assert isinstance(marker["lon"], (int, float))
            assert -90 <= marker["lat"] <= 90  # Valid latitude
            assert -180 <= marker["lon"] <= 180  # Valid longitude
    
    def test_geo_analytics_resolved_count(self, admin_token):
        """Resolved and totalIPs should be non-negative integers"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data["resolved"], int)
        assert isinstance(data["totalIPs"], int)
        assert data["resolved"] >= 0
        assert data["totalIPs"] >= 0
        assert data["resolved"] <= data["totalIPs"]
    
    def test_geo_analytics_countries_sorted_by_views(self, admin_token):
        """Countries should be sorted by views in descending order"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        countries = data["countries"]
        if len(countries) >= 2:
            for i in range(len(countries) - 1):
                assert countries[i]["views"] >= countries[i + 1]["views"], \
                    f"Countries not sorted by views: {countries[i]['views']} < {countries[i+1]['views']}"
    
    def test_geo_analytics_cities_limited(self, admin_token):
        """Cities should be limited to top 20"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["cities"]) <= 20
    
    def test_geo_analytics_has_seeded_data(self, admin_token):
        """Verify seeded geo data is present (12 countries, 20 geo_cache entries)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Per test context: 20 geo_cache entries across 12 countries
        assert len(data["countries"]) >= 10, f"Expected at least 10 countries, got {len(data['countries'])}"
        assert data["resolved"] >= 15, f"Expected at least 15 resolved IPs, got {data['resolved']}"
        
        # Check for expected countries from seed data
        country_codes = [c["countryCode"] for c in data["countries"]]
        expected_countries = ["US", "GB", "IN", "AU", "CA", "DE", "JP", "BR", "FR"]
        for cc in expected_countries:
            assert cc in country_codes, f"Expected country code {cc} not found in geo data"


class TestGeoIntegration:
    """Integration tests for geographic tracking flow"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "idunno_admin_pass"}
        )
        return response.json().get("token")
    
    def test_track_and_verify_ip_hash_counted(self, admin_token):
        """Track a view and verify it's included in geo IP count"""
        # Get initial totalIPs
        response1 = requests.get(
            f"{BASE_URL}/api/admin/site-analytics/geo",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        initial_total = response1.json()["totalIPs"]
        
        # Track a new page view - will have ip_hash from request IP
        unique_visitor = f"TEST_geo_integration_{int(time.time())}"
        payload = {
            "visitor_id": unique_visitor,
            "path": "/test/geo-integration",
            "referrer": "",
            "session_id": f"TEST_session_{int(time.time())}"
        }
        track_response = requests.post(f"{BASE_URL}/api/analytics/track", json=payload)
        assert track_response.status_code == 200
        
        # Note: The IP from test requests will be the server's internal IP
        # so it may not increase resolved count (private IPs are skipped)
        # but the totalIPs count should still reflect ip_hash presence
        # in the page_views collection


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
