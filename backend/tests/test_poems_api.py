"""
Backend API tests for IDunnoPoetry - Testing poem stanza formatting and core API functionality.
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '') or 'http://localhost:8001'
BASE_URL = BASE_URL.rstrip('/')

class TestPoemStanzaFormatting:
    """Tests for poem stanza/line break formatting (critical fix)"""
    
    def test_broken_poem_has_5_stanzas(self):
        """Poem 'Broken' should have 5 stanzas of 4 lines each"""
        response = requests.get(f"{BASE_URL}/api/poems/slug/broken")
        assert response.status_code == 200
        
        data = response.json()
        poem = data.get('poem')
        assert poem is not None, "Poem 'Broken' not found"
        
        content = poem.get('content', '')
        # Stanzas are separated by \n\n (blank lines)
        stanzas = [s.strip() for s in content.split('\n\n') if s.strip()]
        
        assert len(stanzas) == 5, f"Expected 5 stanzas, got {len(stanzas)}"
        
        # Each stanza should have 4 lines
        for i, stanza in enumerate(stanzas):
            lines = [l for l in stanza.split('\n') if l.strip()]
            assert len(lines) == 4, f"Stanza {i+1} should have 4 lines, got {len(lines)}"
        
        print(f"✓ 'Broken' has {len(stanzas)} stanzas, each with 4 lines")

    def test_absolutes_poem_has_5_couplets(self):
        """Poem 'Absolutes' should have 5 couplets (2-line stanzas)"""
        response = requests.get(f"{BASE_URL}/api/poems/slug/absolutes")
        assert response.status_code == 200
        
        data = response.json()
        poem = data.get('poem')
        assert poem is not None, "Poem 'Absolutes' not found"
        
        content = poem.get('content', '')
        stanzas = [s.strip() for s in content.split('\n\n') if s.strip()]
        
        assert len(stanzas) == 5, f"Expected 5 couplets, got {len(stanzas)}"
        
        # Each stanza should be a couplet (2 lines)
        for i, stanza in enumerate(stanzas):
            lines = [l for l in stanza.split('\n') if l.strip()]
            assert len(lines) == 2, f"Couplet {i+1} should have 2 lines, got {len(lines)}"
        
        print(f"✓ 'Absolutes' has {len(stanzas)} couplets (2-line stanzas)")

    def test_think_poem_single_stanza(self):
        """Poem 'Think' should be a single stanza with no blank line breaks"""
        response = requests.get(f"{BASE_URL}/api/poems/slug/think")
        assert response.status_code == 200
        
        data = response.json()
        poem = data.get('poem')
        assert poem is not None, "Poem 'Think' not found"
        
        content = poem.get('content', '')
        # Single stanza means no \n\n separators
        stanza_count = content.count('\n\n') + 1
        
        # If no \n\n, stanza_count should be 1
        if '\n\n' not in content:
            stanza_count = 1
        
        assert stanza_count == 1, f"Expected 1 stanza (no blank lines), got {stanza_count} stanzas"
        
        # Should have 7 lines in single stanza
        lines = [l for l in content.split('\n') if l.strip()]
        assert len(lines) == 7, f"Expected 7 lines, got {len(lines)}"
        
        print(f"✓ 'Think' is a single stanza with {len(lines)} lines")

    def test_poems_endpoint_returns_stanza_separators(self):
        """GET /api/poems should return poems with \\n\\n stanza separators in content field"""
        response = requests.get(f"{BASE_URL}/api/poems")
        assert response.status_code == 200
        
        data = response.json()
        poems = data.get('poems', [])
        assert len(poems) > 0, "No poems returned"
        
        # Check that at least some poems have stanza separators
        poems_with_stanzas = [p for p in poems if '\n\n' in p.get('content', '')]
        assert len(poems_with_stanzas) > 0, "No poems with stanza separators found"
        
        print(f"✓ /api/poems returns {len(poems)} poems, {len(poems_with_stanzas)} with stanza separators")


class TestPoemsListAPI:
    """Tests for poem list and home page API"""
    
    def test_get_all_poems(self):
        """GET /api/poems should return a list of poems"""
        response = requests.get(f"{BASE_URL}/api/poems")
        assert response.status_code == 200
        
        data = response.json()
        assert 'poems' in data
        poems = data['poems']
        assert isinstance(poems, list)
        assert len(poems) > 0, "Expected at least one poem"
        
        # Verify poem structure
        poem = poems[0]
        required_fields = ['id', 'title', 'slug', 'content', 'author', 'date']
        for field in required_fields:
            assert field in poem, f"Missing field: {field}"
        
        print(f"✓ GET /api/poems returns {len(poems)} poems with correct structure")

    def test_get_poem_by_slug(self):
        """GET /api/poems/slug/{slug} should return a single poem"""
        response = requests.get(f"{BASE_URL}/api/poems/slug/broken")
        assert response.status_code == 200
        
        data = response.json()
        assert 'poem' in data
        poem = data['poem']
        assert poem['slug'] == 'broken'
        assert poem['title'] == 'Broken'
        
        print(f"✓ GET /api/poems/slug/broken returns correct poem")

    def test_get_nonexistent_poem(self):
        """GET /api/poems/slug/{invalid_slug} should return 404"""
        response = requests.get(f"{BASE_URL}/api/poems/slug/nonexistent-poem-xyz")
        assert response.status_code == 404
        
        print(f"✓ GET /api/poems/slug/nonexistent returns 404")

    def test_poems_sorting(self):
        """GET /api/poems with sort parameter should work"""
        for sort_option in ['newest', 'oldest', 'rating-high', 'most-viewed']:
            response = requests.get(f"{BASE_URL}/api/poems?sort={sort_option}")
            assert response.status_code == 200
            data = response.json()
            assert 'poems' in data
        
        print(f"✓ GET /api/poems with sorting options works correctly")


class TestCategoriesAndTags:
    """Tests for categories and tags endpoints"""
    
    def test_get_categories(self):
        """GET /api/categories should return category list"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert 'categories' in data
        categories = data['categories']
        assert isinstance(categories, list)
        
        if len(categories) > 0:
            assert 'name' in categories[0]
            assert 'count' in categories[0]
        
        print(f"✓ GET /api/categories returns {len(categories)} categories")

    def test_get_tags(self):
        """GET /api/tags should return tag list"""
        response = requests.get(f"{BASE_URL}/api/tags")
        assert response.status_code == 200
        
        data = response.json()
        assert 'tags' in data
        tags = data['tags']
        assert isinstance(tags, list)
        
        print(f"✓ GET /api/tags returns {len(tags)} tags")


class TestPoemRatingsAPI:
    """Tests for poem ratings endpoint"""
    
    def test_get_rating_status(self):
        """GET /api/poems/{poem_id}/rating-status should return rating status"""
        # First get a poem ID
        response = requests.get(f"{BASE_URL}/api/poems/slug/broken")
        assert response.status_code == 200
        poem_id = response.json()['poem']['id']
        
        # Check rating status
        response = requests.get(f"{BASE_URL}/api/poems/{poem_id}/rating-status")
        assert response.status_code == 200
        
        data = response.json()
        assert 'hasRated' in data
        
        print(f"✓ GET /api/poems/{{poem_id}}/rating-status works correctly")


class TestPoemOfTheDay:
    """Tests for special endpoints"""
    
    def test_poem_of_the_day(self):
        """GET /api/poem-of-the-day should return a poem"""
        response = requests.get(f"{BASE_URL}/api/poem-of-the-day")
        assert response.status_code == 200
        
        data = response.json()
        assert 'poem' in data
        if data['poem']:
            assert 'title' in data['poem']
            assert 'content' in data['poem']
        
        print(f"✓ GET /api/poem-of-the-day returns poem")

    def test_random_poem(self):
        """GET /api/random-poem should return a random poem"""
        response = requests.get(f"{BASE_URL}/api/random-poem")
        assert response.status_code == 200
        
        data = response.json()
        assert 'poem' in data
        if data['poem']:
            assert 'title' in data['poem']
        
        print(f"✓ GET /api/random-poem works correctly")


class TestAdminLogin:
    """Tests for admin authentication"""
    
    def test_admin_login_success(self):
        """POST /api/admin/login with correct password should succeed"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "idunno_admin_pass"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('success') == True
        
        print(f"✓ Admin login with correct password succeeds")

    def test_admin_login_failure(self):
        """POST /api/admin/login with wrong password should fail"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": "wrong_password"}
        )
        assert response.status_code == 401
        
        print(f"✓ Admin login with wrong password returns 401")


class TestApiRoot:
    """Tests for API root"""
    
    def test_api_root(self):
        """GET /api/ should return API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        data = response.json()
        assert 'message' in data
        
        print(f"✓ GET /api/ returns API info")


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
