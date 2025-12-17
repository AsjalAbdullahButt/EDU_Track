"""
Test login functionality with username
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login_with_username():
    """Test login using username"""
    print("Testing login with username...")
    
    # Test with existing username
    payload = {
        "username": "asjal",
        "password": "asjal123"  # Update this to the actual password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✓ Login successful!")
        print(f"  Role: {data.get('role')}")
        print(f"  Name: {data.get('name')}")
        print(f"  Email: {data.get('email')}")
    else:
        print(f"\n❌ Login failed!")

def test_login_with_email():
    """Test login using email (should still work)"""
    print("\n\nTesting login with email...")
    
    payload = {
        "username": "asjal@city.nu.edu.pk",  # using email in username field
        "password": "asjal123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=payload)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✓ Login successful!")
        print(f"  Role: {data.get('role')}")
        print(f"  Name: {data.get('name')}")
        print(f"  Email: {data.get('email')}")
    else:
        print(f"\n❌ Login failed!")

if __name__ == "__main__":
    try:
        test_login_with_username()
        test_login_with_email()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
