import requests
import json

API = "http://127.0.0.1:8000"

print("TESTING FACULTY 1 ENDPOINTS:")
print("=" * 80)

# Test faculty-specific endpoints
print("\n1. Testing /faculties/1/courses endpoint:")
try:
    r = requests.get(f"{API}/faculties/1/courses")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        courses = r.json()
        print(f"   Courses returned: {len(courses)}")
        for c in courses:
            print(f"     - {c.get('course_code')}: {c.get('course_name')}")
    else:
        print(f"   Error: {r.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n2. Testing /faculties/1/students endpoint:")
try:
    r = requests.get(f"{API}/faculties/1/students")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        students = r.json()
        print(f"   Students returned: {len(students)}")
        for s in students[:5]:
            print(f"     - ID {s.get('student_id')}: {s.get('full_name', s.get('name', 'N/A'))}")
    else:
        print(f"   Error: {r.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n3. Testing /courses endpoint (filtered by faculty_id=1):")
try:
    r = requests.get(f"{API}/courses")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        all_courses = r.json()
        faculty_courses = [c for c in all_courses if c.get('faculty_id') == 1]
        print(f"   Total courses in DB: {len(all_courses)}")
        print(f"   Faculty 1 courses: {len(faculty_courses)}")
        for c in faculty_courses:
            print(f"     - Course {c['course_id']}: {c['course_name']} (Faculty ID: {c.get('faculty_id')})")
    else:
        print(f"   Error: {r.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n4. Testing /students endpoint:")
try:
    r = requests.get(f"{API}/students")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        students = r.json()
        print(f"   Total students: {len(students)}")
        if students:
            print(f"   Sample student: ID {students[0]['student_id']}, Name: {students[0].get('full_name')}")
    else:
        print(f"   Error: {r.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n5. Testing /marks endpoint:")
try:
    r = requests.get(f"{API}/marks")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        marks = r.json()
        # Filter for faculty 1's courses (1, 2, 8)
        faculty_marks = [m for m in marks if m.get('course_id') in [1, 2, 8]]
        print(f"   Total marks: {len(marks)}")
        print(f"   Marks for Faculty 1 courses: {len(faculty_marks)}")
        for m in faculty_marks[:5]:
            print(f"     - Student {m['student_id']}, Course {m['course_id']}: {m['total_marks']}, Grade: {m['grade_letter']}")
    else:
        print(f"   Error: {r.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n6. Testing /attendance endpoint:")
try:
    r = requests.get(f"{API}/attendance")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        attendance = r.json()
        faculty_attendance = [a for a in attendance if a.get('course_id') in [1, 2, 8]]
        print(f"   Total attendance records: {len(attendance)}")
        print(f"   Attendance for Faculty 1 courses: {len(faculty_attendance)}")
        for a in faculty_attendance[:3]:
            print(f"     - Student {a['student_id']}, Course {a['course_id']}, Date: {a.get('date')}, Status: {a['status']}")
    else:
        print(f"   Error: {r.text}")
except Exception as e:
    print(f"   Exception: {e}")

print("\n" + "=" * 80)
print("ENDPOINT TEST COMPLETE")
