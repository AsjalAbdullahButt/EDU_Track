import requests
import json

# Test the login endpoint
base_url = "http://127.0.0.1:8000"

# Test credentials from LOGIN_CREDENTIALS.txt
test_accounts = [
    {"username": "asjal", "password": "password123"},
    {"username": "asjal@student.com", "password": "password123"},
]

print("Testing EDU-Track Login API...")
print("=" * 50)

for account in test_accounts:
    print(f"\nTesting: {account['username']}")
    print("-" * 50)
    
    # Try login endpoint
    try:
        response = requests.post(
            f"{base_url}/auth/login",
            json=account,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✓ Login successful!")
        else:
            print("✗ Login failed!")
            
    except Exception as e:
        print(f"✗ Error: {e}")

# Check database directly
print("\n" + "=" * 50)
print("Checking database for asjal user...")
print("=" * 50)

import pymysql
import os
from dotenv import load_dotenv

load_dotenv('.env')

try:
    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "edu_track")
    )
    
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Check for asjal user
    cursor.execute("SELECT student_id, username, email, password, role FROM Student WHERE username = 'asjal' OR email = 'asjal@student.com'")
    result = cursor.fetchone()
    
    if result:
        print("\n✓ User found in database:")
        print(f"  Student ID: {result['student_id']}")
        print(f"  Username: {result['username']}")
        print(f"  Email: {result['email']}")
        print(f"  Role: {result['role']}")
        print(f"  Password Hash: {result['password'][:50]}...")
    else:
        print("✗ User not found in database!")
    
    conn.close()
    
except Exception as e:
    print(f"✗ Database error: {e}")
