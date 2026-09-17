#!/usr/bin/env python3
"""
Detailed test for duplicate vote prevention issue
"""

import requests
import json
import time

BASE_URL = "https://verse-hub-12.preview.emergentagent.com/api"

def test_duplicate_vote_detailed():
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'User-Agent': 'IDunnoPoetry-Duplicate-Test/1.0'
    })
    
    # Get poems first
    response = session.get(f"{BASE_URL}/poems")
    poems = response.json()['poems']
    poem_id = poems[0]['id']
    
    print(f"Testing duplicate vote prevention for poem ID: {poem_id}")
    
    # Check initial rating status
    status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
    initial_status = status_response.json()
    print(f"Initial rating status: {initial_status}")
    
    # First vote
    rating_data = {"rating": 4}
    print(f"\n1st vote attempt...")
    response1 = session.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
    print(f"Response 1: {response1.status_code} - {response1.text}")
    
    # Check status after first vote
    status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
    status_after_first = status_response.json()
    print(f"Status after 1st vote: {status_after_first}")
    
    # Second vote (should be blocked)
    print(f"\n2nd vote attempt (should be blocked)...")
    response2 = session.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
    print(f"Response 2: {response2.status_code} - {response2.text}")
    
    # Check final status
    status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
    final_status = status_response.json()
    print(f"Final status: {final_status}")
    
    # Test with different session (different visitor ID)
    print(f"\n3rd vote attempt with different session...")
    session2 = requests.Session()
    session2.headers.update({
        'Content-Type': 'application/json',
        'User-Agent': 'IDunnoPoetry-Different-User/1.0'  # Different user agent
    })
    
    response3 = session2.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
    print(f"Response 3 (different session): {response3.status_code} - {response3.text}")

if __name__ == "__main__":
    test_duplicate_vote_detailed()