import requests
import json
import time

# Wait for server to be ready
time.sleep(2)

base_url = "http://127.0.0.1:8000"

print("Testing Faculty Courses Endpoint")
print("=" * 50)

try:
    # Test faculty courses endpoint
    url = f"{base_url}/faculties/1/courses"
    print(f"\nGET {url}")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Number of courses: {len(data)}")
        print("\nCourses:")
        for course in data:
            print(f"  - {course.get('course_code')}: {course.get('course_name')} ({course.get('credit_hours')} credits)")
    else:
        print(f"Error Response: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
