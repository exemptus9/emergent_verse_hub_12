#!/usr/bin/env python3
"""
Test to check visitor ID consistency
"""

import requests
import json

BASE_URL = "https://verse-hub-12.preview.emergentagent.com/api"

def test_visitor_id_consistency():
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'User-Agent': 'Consistent-Test-Agent/1.0'
    })
    
    # Get poems
    response = session.get(f"{BASE_URL}/poems")
    poems = response.json()['poems']
    
    # Find a poem that hasn't been rated by this visitor
    for poem in poems:
        poem_id = poem['id']
        
        # Check rating status
        status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
        status = status_response.json()
        
        if not status.get('hasRated', True):
            print(f"Found unrated poem: {poem_id} - {poem.get('title', 'Unknown')}")
            
            # Rate it
            rating_data = {"rating": 5}
            rate_response = session.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
            print(f"First rating: {rate_response.status_code} - {rate_response.text}")
            
            # Check status immediately
            status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
            status_after = status_response.json()
            print(f"Status after rating: {status_after}")
            
            # Try to rate again with same session
            rate_response2 = session.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
            print(f"Second rating attempt: {rate_response2.status_code} - {rate_response2.text}")
            
            break
    else:
        print("No unrated poems found for this visitor")

if __name__ == "__main__":
    test_visitor_id_consistency()