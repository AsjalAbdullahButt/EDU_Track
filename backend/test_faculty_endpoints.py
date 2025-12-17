import requests
import json

API_BASE = "http://127.0.0.1:8000"

print("COMPREHENSIVE FACULTY ENDPOINT TEST:")
print("=" * 80)

# Test all corrected endpoints
tests = [
    ("/student", "Get all students"),
    ("/faculties", "Get all faculty"),
    ("/faculties/1", "Get faculty ID 1"),
    ("/courses", "Get all courses"),
    ("/enrollments", "Get all enrollments"),
    ("/marks", "Get all marks"),
    ("/attendance", "Get all attendance"),
    ("/notifications", "Get all notifications"),
    ("/feedback", "Get all feedback"),
]

results = []
for endpoint, description in tests:
    try:
        r = requests.get(f"{API_BASE}{endpoint}")
        status = "✓ PASS" if r.status_code == 200 else f"✗ FAIL ({r.status_code})"
        count = len(r.json()) if r.status_code == 200 and isinstance(r.json(), list) else "N/A"
        results.append((endpoint, description, status, count))
        print(f"{status:12} {endpoint:20} - {description:30} Records: {count}")
    except Exception as e:
        results.append((endpoint, description, f"✗ ERROR", str(e)))
        print(f"{'✗ ERROR':12} {endpoint:20} - {description:30} Error: {str(e)[:30]}")

# Test faculty-specific data
print("\n" + "=" * 80)
print("FACULTY 1 (Dr. Imran Sheikh) DATA:")
print("-" * 80)

# Get faculty 1 courses
r = requests.get(f"{API_BASE}/courses")
if r.status_code == 200:
    courses = [c for c in r.json() if c.get('faculty_id') == 1]
    print(f"\nCourses taught: {len(courses)}")
    for c in courses:
        print(f"  - {c['course_code']}: {c['course_name']}")
        
        # Get students in this course
        r2 = requests.get(f"{API_BASE}/enrollments")
        if r2.status_code == 200:
            enrollments = [e for e in r2.json() if e.get('course_id') == c['course_id']]
            print(f"    Students enrolled: {len(enrollments)}")
            
            # Get marks for this course
            r3 = requests.get(f"{API_BASE}/marks")
            if r3.status_code == 200:
                marks = [m for m in r3.json() if m.get('course_id') == c['course_id']]
                print(f"    Marks records: {len(marks)}")

print("\n" + "=" * 80)
print("TEST COMPLETE")
