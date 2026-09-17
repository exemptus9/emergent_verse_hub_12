#!/usr/bin/env python3
"""
Comprehensive final test of all IDunnoPoetry backend APIs
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "https://verse-hub-12.preview.emergentagent.com/api"

class FinalTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'IDunnoPoetry-Final-Test/1.0'
        })
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str):
        self.results.append({'test': test_name, 'success': success, 'message': message})
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
    
    def test_all_endpoints(self):
        print("🚀 Final Comprehensive Test of IDunnoPoetry Backend APIs")
        print(f"🔗 Testing against: {BASE_URL}")
        print("=" * 70)
        
        # 1. Test GET /api/poems with all sort options
        sort_options = ["newest", "oldest", "rating-high", "rating-low", "most-rated"]
        for sort_opt in sort_options:
            try:
                response = self.session.get(f"{BASE_URL}/poems?sort={sort_opt}")
                if response.status_code == 200:
                    poems = response.json().get('poems', [])
                    self.log_result(f"GET /api/poems?sort={sort_opt}", True, 
                                  f"Retrieved {len(poems)} poems")
                else:
                    self.log_result(f"GET /api/poems?sort={sort_opt}", False, 
                                  f"Status {response.status_code}")
            except Exception as e:
                self.log_result(f"GET /api/poems?sort={sort_opt}", False, f"Exception: {e}")
        
        # 2. Test filtering
        try:
            response = self.session.get(f"{BASE_URL}/poems?category=Uncategorized")
            if response.status_code == 200:
                poems = response.json().get('poems', [])
                self.log_result("GET /api/poems - Category Filter", True, 
                              f"Filtered {len(poems)} poems by category")
            else:
                self.log_result("GET /api/poems - Category Filter", False, 
                              f"Status {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/poems - Category Filter", False, f"Exception: {e}")
        
        # 3. Test get poem by slug
        test_slugs = ["helping-hand", "love-burden", "non-existent-slug"]
        for slug in test_slugs:
            try:
                response = self.session.get(f"{BASE_URL}/poems/slug/{slug}")
                if slug == "non-existent-slug":
                    expected_status = 404
                    success = response.status_code == 404
                    message = "Correctly returned 404" if success else f"Expected 404, got {response.status_code}"
                else:
                    expected_status = 200
                    success = response.status_code == 200
                    if success:
                        poem = response.json().get('poem', {})
                        message = f"Retrieved poem: {poem.get('title', 'Unknown')}"
                    else:
                        message = f"Expected 200, got {response.status_code}"
                
                self.log_result(f"GET /api/poems/slug/{slug}", success, message)
            except Exception as e:
                self.log_result(f"GET /api/poems/slug/{slug}", False, f"Exception: {e}")
        
        # 4. Test rating system with proper duplicate prevention
        try:
            # Get poems first
            response = self.session.get(f"{BASE_URL}/poems")
            poems = response.json().get('poems', [])
            
            # Find an unrated poem
            test_poem_id = None
            for poem in poems:
                status_response = self.session.get(f"{BASE_URL}/poems/{poem['id']}/rating-status")
                if status_response.status_code == 200:
                    status = status_response.json()
                    if not status.get('hasRated', True):
                        test_poem_id = poem['id']
                        break
            
            if test_poem_id:
                # Test valid rating
                rating_data = {"rating": 4}
                response = self.session.post(f"{BASE_URL}/poems/{test_poem_id}/rate", json=rating_data)
                if response.status_code == 200:
                    data = response.json()
                    self.log_result("POST /api/poems/:id/rate - Valid", True, 
                                  f"Rating successful. New rating: {data.get('newRating')}")
                    
                    # Test duplicate prevention
                    response2 = self.session.post(f"{BASE_URL}/poems/{test_poem_id}/rate", json=rating_data)
                    if response2.status_code == 400:
                        self.log_result("POST /api/poems/:id/rate - Duplicate Prevention", True, 
                                      "Correctly blocked duplicate vote")
                    else:
                        self.log_result("POST /api/poems/:id/rate - Duplicate Prevention", False, 
                                      f"Expected 400, got {response2.status_code}")
                    
                    # Test rating status
                    status_response = self.session.get(f"{BASE_URL}/poems/{test_poem_id}/rating-status")
                    if status_response.status_code == 200:
                        status = status_response.json()
                        if status.get('hasRated') and 'userRating' in status:
                            self.log_result("GET /api/poems/:id/rating-status", True, 
                                          f"Shows hasRated: true with userRating: {status['userRating']}")
                        else:
                            self.log_result("GET /api/poems/:id/rating-status", False, 
                                          "Incorrect rating status response")
                else:
                    self.log_result("POST /api/poems/:id/rate - Valid", False, 
                                  f"Status {response.status_code}")
            else:
                self.log_result("Rating System", False, "No unrated poems available for testing")
                
        except Exception as e:
            self.log_result("Rating System", False, f"Exception: {e}")
        
        # 5. Test comments system
        try:
            if test_poem_id:
                # Get existing comments
                response = self.session.get(f"{BASE_URL}/poems/{test_poem_id}/comments")
                if response.status_code == 200:
                    initial_comments = response.json().get('comments', [])
                    self.log_result("GET /api/poems/:id/comments", True, 
                                  f"Retrieved {len(initial_comments)} comments")
                    
                    # Add a comment
                    comment_data = {
                        "author": "Final Tester",
                        "content": "This is a comprehensive test comment. The poem is beautiful!"
                    }
                    response = self.session.post(f"{BASE_URL}/poems/{test_poem_id}/comments", 
                                               json=comment_data)
                    if response.status_code == 200:
                        self.log_result("POST /api/poems/:id/comments", True, 
                                      "Successfully added comment")
                        
                        # Verify comment was added
                        time.sleep(1)
                        response = self.session.get(f"{BASE_URL}/poems/{test_poem_id}/comments")
                        if response.status_code == 200:
                            new_comments = response.json().get('comments', [])
                            if len(new_comments) > len(initial_comments):
                                self.log_result("POST /api/poems/:id/comments - Verification", True, 
                                              "Comment appears in GET response")
                            else:
                                self.log_result("POST /api/poems/:id/comments - Verification", False, 
                                              "Comment not found in GET response")
                    else:
                        self.log_result("POST /api/poems/:id/comments", False, 
                                      f"Status {response.status_code}")
                else:
                    self.log_result("GET /api/poems/:id/comments", False, 
                                  f"Status {response.status_code}")
        except Exception as e:
            self.log_result("Comments System", False, f"Exception: {e}")
        
        # 6. Test categories endpoint
        try:
            response = self.session.get(f"{BASE_URL}/categories")
            if response.status_code == 200:
                data = response.json()
                categories = data.get('categories', [])
                self.log_result("GET /api/categories", True, 
                              f"Retrieved {len(categories)} categories")
            else:
                self.log_result("GET /api/categories", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/categories", False, f"Exception: {e}")
        
        # 7. Test tags endpoint
        try:
            response = self.session.get(f"{BASE_URL}/tags")
            if response.status_code == 200:
                data = response.json()
                tags = data.get('tags', [])
                self.log_result("GET /api/tags", True, f"Retrieved {len(tags)} tags")
            else:
                self.log_result("GET /api/tags", False, f"Status {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/tags", False, f"Exception: {e}")
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 FINAL TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for r in self.results if r['success'])
        failed = len(self.results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = FinalTester()
    passed, failed = tester.test_all_endpoints()
    exit(0 if failed == 0 else 1)