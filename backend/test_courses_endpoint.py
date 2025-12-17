import requests
import time

time.sleep(2)

API = "http://127.0.0.1:8000"

print("Testing Faculty Courses Endpoint:")
print("=" * 80)

# Test the endpoint
try:
    r = requests.get(f"{API}/faculties/1/courses")
    print(f"GET /faculties/1/courses")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        courses = r.json()
        print(f"Courses returned: {len(courses)}")
        print(f"\nData received:")
        for c in courses:
            print(f"  - ID: {c.get('course_id')}, Code: {c.get('course_code')}, Name: {c.get('course_name')}")
    else:
        print(f"Response: {r.text}")
except Exception as e:
    print(f"ERROR: {e}")

# Test alternative - filter /courses by faculty_id
print("\n" + "=" * 80)
print("Testing /courses endpoint (filtering manually):")
try:
    r = requests.get(f"{API}/courses")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        all_courses = r.json()
        faculty1_courses = [c for c in all_courses if c.get('faculty_id') == 1]
        print(f"Total courses: {len(all_courses)}")
        print(f"Faculty 1 courses: {len(faculty1_courses)}")
        for c in faculty1_courses:
            print(f"  - Course {c['course_id']}: {c['course_name']} (Faculty: {c.get('faculty_id')})")
except Exception as e:
    print(f"ERROR: {e}")
