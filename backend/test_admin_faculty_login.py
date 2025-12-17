import requests

BASE_URL = "http://127.0.0.1:8000"

# Test Admin Login
print("Testing Admin Login...")
admin_data = {
    "username": "admin@edu.com",
    "password": "password123",
    "role": "admin"
}
response = requests.post(f"{BASE_URL}/auth/login", json=admin_data)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"✓ Admin login successful: {response.json()}")
else:
    print(f"✗ Admin login failed: {response.text}")

# Test Faculty Login
print("\nTesting Faculty Login...")
faculty_data = {
    "username": "imran@faculty.com",
    "password": "password123",
    "role": "faculty"
}
response = requests.post(f"{BASE_URL}/auth/login", json=faculty_data)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(f"✓ Faculty login successful: {response.json()}")
else:
    print(f"✗ Faculty login failed: {response.text}")
