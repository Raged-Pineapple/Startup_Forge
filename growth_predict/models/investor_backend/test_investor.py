import requests
import json
import time
import sys

def test_matching():
    url = "http://localhost:8002/match"
    
    payload = {
        "sector": ["AI", "Healthcare"],
        "stage": "Seed",
        "growth_rate": 0.24
    }
    
    print(f"Sending payload to {url}...")
    print(json.dumps(payload, indent=2))
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print("\nResponse:")
        print(json.dumps(data, indent=2))
        
        matches = data.get("matches", [])
        assert len(matches) > 0
        print(f"\n[SUCCESS] Found {len(matches)} matches.")
        
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Could not connect to server. Is it running?")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        if 'response' in locals():
            print(f"Status Code: {response.status_code}")
            print(f"Response Content: {response.text}")
        sys.exit(1)

if __name__ == "__main__":
    time.sleep(10) # Wait longer for embedding generation
    test_matching()
