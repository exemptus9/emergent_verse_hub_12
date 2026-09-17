#!/usr/bin/env python3
"""
Debug test to check what's happening with visitor IDs and database storage
"""

import requests
import json
import hashlib

BASE_URL = "https://verse-hub-12.preview.emergentagent.com/api"

def debug_visitor_id():
    # Simulate the visitor ID generation
    ip = "10.64.131.70"  # Example IP from logs
    user_agent = "IDunnoPoetry-Tester/1.0"
    raw = f"{ip}:{user_agent}"
    visitor_id = hashlib.sha256(raw.encode()).hexdigest()[:32]
    
    print(f"Simulated visitor ID generation:")
    print(f"IP: {ip}")
    print(f"User-Agent: {user_agent}")
    print(f"Raw string: {raw}")
    print(f"Generated visitor ID: {visitor_id}")
    
    # Test with actual request
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'User-Agent': user_agent
    })
    
    # Get poems
    response = session.get(f"{BASE_URL}/poems")
    poems = response.json()['poems']
    poem_id = poems[-1]['id']  # Use last poem to avoid conflicts
    
    print(f"\nTesting with poem ID: {poem_id}")
    
    # Check initial status
    status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
    print(f"Initial status: {status_response.json()}")
    
    # Try to rate
    rating_data = {"rating": 3}
    rate_response = session.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
    print(f"Rate response: {rate_response.status_code} - {rate_response.text}")
    
    # Check status again
    status_response = session.get(f"{BASE_URL}/poems/{poem_id}/rating-status")
    print(f"Status after rating: {status_response.json()}")
    
    # Try to rate again immediately
    rate_response2 = session.post(f"{BASE_URL}/poems/{poem_id}/rate", json=rating_data)
    print(f"Second rate response: {rate_response2.status_code} - {rate_response2.text}")

if __name__ == "__main__":
    debug_visitor_id()