#!/usr/bin/env python3
"""
IDunnoPoetry Backend API Test Suite
Tests all backend endpoints for the poetry rating application
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Backend URL from frontend/.env
BASE_URL = "https://verse-hub-12.preview.emergentagent.com/api"

class IDunnoPoetryTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'IDunnoPoetry-Tester/1.0'
        })
        self.test_results = []
        self.poem_ids = []
        self.poem_slugs = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_get_poems_basic(self):
        """Test GET /api/poems - basic functionality"""
        try:
            response = self.session.get(f"{BASE_URL}/poems")
            
            if response.status_code != 200:
                self.log_result("GET /api/poems - Basic", False, 
                              f"Expected 200, got {response.status_code}", 
                              {"response": response.text})
                return False
            
            data = response.json()
            
            if 'poems' not in data:
                self.log_result("GET /api/poems - Basic", False, 
                              "Response missing 'poems' key", {"data": data})
                return False
            
            poems = data['poems']
            if not isinstance(poems, list) or len(poems) == 0:
                self.log_result("GET /api/poems - Basic", False, 
                              "No poems returned or invalid format", {"poems_count": len(poems)})
                return False
            
            # Store poem IDs and slugs for later tests
            for poem in poems:
                if 'id' in poem:
                    self.poem_ids.append(poem['id'])
                if 'slug' in poem:
                    self.poem_slugs.append(poem['slug'])
            
            self.log_result("GET /api/poems - Basic", True, 
                          f"Successfully retrieved {len(poems)} poems")
            return True
            
        except Exception as e:
            self.log_result("GET /api/poems - Basic", False, f"Exception: {str(e)}")
            return False
    
    def test_get_poems_sorting(self):
        """Test GET /api/poems with different sort options"""
        sort_options = ["newest", "oldest", "rating-high", "rating-low", "most-rated"]
        
        for sort_option in sort_options:
            try:
                response = self.session.get(f"{BASE_URL}/poems?sort={sort_option}")
                
                if response.status_code != 200:
                    self.log_result(f"GET /api/poems - Sort {sort_option}", False, 
                                  f"Expected 200, got {response.status_code}")
                    continue
                
                data = response.json()
                poems = data.get('poems', [])
                
                if len(poems) == 0:
                    self.log_result(f"GET /api/poems - Sort {sort_option}", False, 
                                  "No poems returned")
                    continue
                
                # Verify sorting logic
                if sort_option == "rating-high" and len(poems) > 1:
                    # Check if ratings are in descending order
                    ratings = [poem.get('rating', 0) for poem in poems]
                    is_sorted = all(ratings[i] >= ratings[i+1] for i in range(len(ratings)-1))
                    if not is_sorted:
                        self.log_result(f"GET /api/poems - Sort {sort_option}", False, 
                                      "Poems not sorted by rating (high to low)")
                        continue
                
                self.log_result(f"GET /api/poems - Sort {sort_option}", True, 
                              f"Successfully sorted {len(poems)} poems")
                
            except Exception as e:
                self.log_result(f"GET /api/poems - Sort {sort_option}", False, 
                              f"Exception: {str(e)}")
    
    def test_get_poems_filtering(self):
        """Test GET /api/poems with category and tag filtering"""
        # Test category filtering
        try:
            response = self.session.get(f"{BASE_URL}/poems?category=Uncategorized")
            if response.status_code == 200:
                data = response.json()
                poems = data.get('poems', [])
                self.log_result("GET /api/poems - Category Filter", True, 
                              f"Category filter returned {len(poems)} poems")
            else:
                self.log_result("GET /api/poems - Category Filter", False, 
                              f"Expected 200, got {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/poems - Category Filter", False, f"Exception: {str(e)}")
        
        # Test tag filtering
        try:
            response = self.session.get(f"{BASE_URL}/poems?tag=love")
            if response.status_code == 200:
                data = response.json()
                poems = data.get('poems', [])
                self.log_result("GET /api/poems - Tag Filter", True, 
                              f"Tag filter returned {len(poems)} poems")
            else:
                self.log_result("GET /api/poems - Tag Filter", False, 
                              f"Expected 200, got {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/poems - Tag Filter", False, f"Exception: {str(e)}")
    
    def test_get_poem_by_slug(self):
        """Test GET /api/poems/slug/:slug"""
        if not self.poem_slugs:
            self.log_result("GET /api/poems/slug/:slug", False, "No poem slugs available for testing")
            return
        
        # Test with known slugs from the seeded data
        test_slugs = ["helping-hand", "love-burden"]
        
        for slug in test_slugs:
            try:
                response = self.session.get(f"{BASE_URL}/poems/slug/{slug}")
                
                if response.status_code != 200:
                    self.log_result(f"GET /api/poems/slug/{slug}", False, 
                                  f"Expected 200, got {response.status_code}")
                    continue
                
                data = response.json()
                
                if 'poem' not in data:
                    self.log_result(f"GET /api/poems/slug/{slug}", False, 
                                  "Response missing 'poem' key")
                    continue
                
                poem = data['poem']
                if poem.get('slug') != slug:
                    self.log_result(f"GET /api/poems/slug/{slug}", False, 
                                  f"Returned poem has wrong slug: {poem.get('slug')}")
                    continue
                
                self.log_result(f"GET /api/poems/slug/{slug}", True, 
                              f"Successfully retrieved poem: {poem.get('title', 'Unknown')}")
                
            except Exception as e:
                self.log_result(f"GET /api/poems/slug/{slug}", False, f"Exception: {str(e)}")
        
        # Test with non-existent slug
        try:
            response = self.session.get(f"{BASE_URL}/poems/slug/non-existent-slug")
            if response.status_code == 404:
                self.log_result("GET /api/poems/slug/non-existent", True, 
                              "Correctly returned 404 for non-existent slug")
            else:
                self.log_result("GET /api/poems/slug/non-existent", False, 
                              f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/poems/slug/non-existent", False, f"Exception: {str(e)}")
    
    def test_rating_system(self):
        """Test POST /api/poems/:id/rate and duplicate prevention"""
        if not self.poem_ids:
            self.log_result("Rating System", False, "No poem IDs available for testing")
            return
        
        poem_id = self.poem_ids[0]  # Use first poem for testing
        
        # Test valid rating
        try:
            rating_data = {"rating": 5}
            response = self.session.post(f"{BASE_URL}/poems/{poem_id}/rate", 
                                       json=rating_data)
            
            if response.status_code != 200:
                self.log_result("POST /api/poems/:id/rate - Valid", False, 
                              f"Expected 200, got {response.status_code}", 
                              {"response": response.text})
                return
            
            data = response.json()
            required_fields = ['success', 'newRating', 'ratingCount', 'userRating']
            
            for field in required_fields:
                if field not in data:
                    self.log_result("POST /api/poems/:id/rate - Valid", False, 
                                  f"Response missing '{field}' field")
                    return
            
            if data['userRating'] != 5:
                self.log_result("POST /api/poems/:id/rate - Valid", False, 
                              f"Expected userRating 5, got {data['userRating']}")
                return
            
            self.log_result("POST /api/poems/:id/rate - Valid", True, 
                          f"Successfully rated poem. New rating: {data['newRating']}, Count: {data['ratingCount']}")
            
            # Test duplicate vote prevention - CRITICAL TEST
            time.sleep(1)  # Small delay
            response2 = self.session.post(f"{BASE_URL}/poems/{poem_id}/rate", 
                                        json=rating_data)
            
            if response2.status_code == 400:
                self.log_result("POST /api/poems/:id/rate - Duplicate Prevention", True, 
                              "Correctly prevented duplicate vote with 400 error")
            else:
                self.log_result("POST /api/poems/:id/rate - Duplicate Prevention", False, 
                              f"Expected 400 for duplicate vote, got {response2.status_code}")
            
        except Exception as e:
            self.log_result("POST /api/poems/:id/rate", False, f"Exception: {str(e)}")
        
        # Test invalid rating values
        invalid_ratings = [0, 6, -1, "invalid"]
        for invalid_rating in invalid_ratings:
            try:
                rating_data = {"rating": invalid_rating}
                response = self.session.post(f"{BASE_URL}/poems/{poem_id}/rate", 
                                           json=rating_data)
                
                if response.status_code in [400, 422]:  # Should reject invalid ratings
                    self.log_result(f"POST /api/poems/:id/rate - Invalid {invalid_rating}", True, 
                                  "Correctly rejected invalid rating")
                else:
                    self.log_result(f"POST /api/poems/:id/rate - Invalid {invalid_rating}", False, 
                                  f"Should reject invalid rating, got {response.status_code}")
            except Exception as e:
                self.log_result(f"POST /api/poems/:id/rate - Invalid {invalid_rating}", False, 
                              f"Exception: {str(e)}")
    
    def test_rating_status(self):
        """Test GET /api/poems/:id/rating-status"""
        if not self.poem_ids:
            self.log_result("GET /api/poems/:id/rating-status", False, "No poem IDs available")
            return
        
        poem_id = self.poem_ids[0]  # Use same poem that was rated above
        
        try:
            response = self.session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
            
            if response.status_code != 200:
                self.log_result("GET /api/poems/:id/rating-status", False, 
                              f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            if 'hasRated' not in data:
                self.log_result("GET /api/poems/:id/rating-status", False, 
                              "Response missing 'hasRated' field")
                return
            
            # Since we rated this poem above, it should show hasRated: true
            if data['hasRated']:
                if 'userRating' in data:
                    self.log_result("GET /api/poems/:id/rating-status", True, 
                                  f"Correctly shows hasRated: true with userRating: {data['userRating']}")
                else:
                    self.log_result("GET /api/poems/:id/rating-status", False, 
                                  "hasRated is true but userRating missing")
            else:
                # Test with a different poem that hasn't been rated
                if len(self.poem_ids) > 1:
                    unrated_poem_id = self.poem_ids[1]
                    response2 = self.session.get(f"{BASE_URL}/poems/{unrated_poem_id}/rating-status")
                    if response2.status_code == 200:
                        data2 = response2.json()
                        if data2.get('hasRated') == False:
                            self.log_result("GET /api/poems/:id/rating-status", True, 
                                          "Correctly shows hasRated: false for unrated poem")
                        else:
                            self.log_result("GET /api/poems/:id/rating-status", False, 
                                          "Should show hasRated: false for unrated poem")
                
        except Exception as e:
            self.log_result("GET /api/poems/:id/rating-status", False, f"Exception: {str(e)}")
    
    def test_comments_system(self):
        """Test GET/POST /api/poems/:id/comments"""
        if not self.poem_ids:
            self.log_result("Comments System", False, "No poem IDs available")
            return
        
        poem_id = self.poem_ids[0]
        
        # Test GET comments
        try:
            response = self.session.get(f"{BASE_URL}/poems/{poem_id}/comments")
            
            if response.status_code != 200:
                self.log_result("GET /api/poems/:id/comments", False, 
                              f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            if 'comments' not in data:
                self.log_result("GET /api/poems/:id/comments", False, 
                              "Response missing 'comments' key")
                return
            
            initial_comment_count = len(data['comments'])
            self.log_result("GET /api/poems/:id/comments", True, 
                          f"Successfully retrieved {initial_comment_count} comments")
            
        except Exception as e:
            self.log_result("GET /api/poems/:id/comments", False, f"Exception: {str(e)}")
            return
        
        # Test POST comment
        try:
            comment_data = {
                "author": "Test User",
                "content": "This is a test comment from the automated test suite. Great poem!"
            }
            
            response = self.session.post(f"{BASE_URL}/poems/{poem_id}/comments", 
                                       json=comment_data)
            
            if response.status_code != 200:
                self.log_result("POST /api/poems/:id/comments", False, 
                              f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            if 'comment' not in data:
                self.log_result("POST /api/poems/:id/comments", False, 
                              "Response missing 'comment' key")
                return
            
            comment = data['comment']
            if comment.get('content') != comment_data['content']:
                self.log_result("POST /api/poems/:id/comments", False, 
                              "Comment content doesn't match")
                return
            
            self.log_result("POST /api/poems/:id/comments", True, 
                          f"Successfully added comment by {comment.get('author')}")
            
            # Verify comment appears in GET request
            time.sleep(1)
            response2 = self.session.get(f"{BASE_URL}/poems/{poem_id}/comments")
            if response2.status_code == 200:
                data2 = response2.json()
                new_comment_count = len(data2['comments'])
                if new_comment_count > initial_comment_count:
                    self.log_result("POST /api/poems/:id/comments - Verification", True, 
                                  "Comment successfully appears in GET response")
                else:
                    self.log_result("POST /api/poems/:id/comments - Verification", False, 
                                  "Comment not found in subsequent GET request")
            
        except Exception as e:
            self.log_result("POST /api/poems/:id/comments", False, f"Exception: {str(e)}")
    
    def test_categories_endpoint(self):
        """Test GET /api/categories"""
        try:
            response = self.session.get(f"{BASE_URL}/categories")
            
            if response.status_code != 200:
                self.log_result("GET /api/categories", False, 
                              f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            if 'categories' not in data:
                self.log_result("GET /api/categories", False, 
                              "Response missing 'categories' key")
                return
            
            categories = data['categories']
            
            if not isinstance(categories, list):
                self.log_result("GET /api/categories", False, 
                              "Categories should be a list")
                return
            
            # Verify category structure
            for category in categories:
                if not isinstance(category, dict) or 'name' not in category or 'count' not in category:
                    self.log_result("GET /api/categories", False, 
                                  "Invalid category structure")
                    return
            
            self.log_result("GET /api/categories", True, 
                          f"Successfully retrieved {len(categories)} categories")
            
        except Exception as e:
            self.log_result("GET /api/categories", False, f"Exception: {str(e)}")
    
    def test_tags_endpoint(self):
        """Test GET /api/tags"""
        try:
            response = self.session.get(f"{BASE_URL}/tags")
            
            if response.status_code != 200:
                self.log_result("GET /api/tags", False, 
                              f"Expected 200, got {response.status_code}")
                return
            
            data = response.json()
            
            if 'tags' not in data:
                self.log_result("GET /api/tags", False, 
                              "Response missing 'tags' key")
                return
            
            tags = data['tags']
            
            if not isinstance(tags, list):
                self.log_result("GET /api/tags", False, 
                              "Tags should be a list")
                return
            
            # Verify tag structure
            for tag in tags:
                if not isinstance(tag, dict) or 'name' not in tag or 'count' not in tag:
                    self.log_result("GET /api/tags", False, 
                                  "Invalid tag structure")
                    return
            
            self.log_result("GET /api/tags", True, 
                          f"Successfully retrieved {len(tags)} tags")
            
        except Exception as e:
            self.log_result("GET /api/tags", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting IDunnoPoetry Backend API Tests")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Run tests in logical order
        self.test_get_poems_basic()
        self.test_get_poems_sorting()
        self.test_get_poems_filtering()
        self.test_get_poem_by_slug()
        self.test_rating_system()
        self.test_rating_status()
        self.test_comments_system()
        self.test_categories_endpoint()
        self.test_tags_endpoint()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = IDunnoPoetryTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)