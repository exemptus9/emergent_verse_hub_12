#!/usr/bin/env python3
"""
Test to see what IP and headers are being received by the backend
"""

import requests
import json

BASE_URL = "https://verse-hub-12.preview.emergentagent.com/api"

def test_ip_headers():
    # Create a test session
    session = requests.Session()
    session.headers.update({
        'Content-Type': 'application/json',
        'User-Agent': 'IP-Debug-Test/1.0',
        'X-Test-Header': 'debug-value'
    })
    
    print("Testing IP and header visibility...")
    
    # Make multiple requests to see if IP changes
    for i in range(3):
        try:
            response = session.get(f"{BASE_URL}/poems")
            print(f"Request {i+1}: Status {response.status_code}")
            
            # Check if there are any debug headers in response
            print(f"Response headers: {dict(response.headers)}")
            
        except Exception as e:
            print(f"Request {i+1} failed: {e}")

if __name__ == "__main__":
    test_ip_headers()