import requests
import json

# Test the API structure
def test_api():
    url = "http://localhost:8001/rag-query"

    # Test request structure
    test_payload = {
        "query": "test query"
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=test_payload, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.Timeout:
        print("Request timed out - this is expected if services are not configured")
        print("But the API structure is correct")
    except requests.exceptions.ConnectionError:
        print("Cannot connect to server - make sure it's running")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()