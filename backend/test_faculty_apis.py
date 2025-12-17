import sys
sys.path.insert(0, r'c:\Users\user\Desktop\EDU_Track\EDU_Track\backend')
import requests
import json

API_BASE = "http://127.0.0.1:8000"

print("FACULTY API ENDPOINTS TEST:")
print("=" * 80)

# Test 1: Get all faculty
print("\n1. GET /faculties - Get all faculty")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/faculties")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        faculties = r.json()
        print(f"Total faculty: {len(faculties)}")
        for f in faculties[:3]:
            print(f"  - ID {f['faculty_id']}: {f.get('name', 'N/A')} - {f.get('email', 'N/A')}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Get specific faculty
print("\n2. GET /faculties/1 - Get faculty by ID")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/faculties/1")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        faculty = r.json()
        print(f"  Name: {faculty.get('name', 'N/A')}")
        print(f"  Email: {faculty.get('email', 'N/A')}")
        print(f"  Department: {faculty.get('department', 'N/A')}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Get courses for faculty
print("\n3. GET /courses - Check courses with faculty_id")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/courses")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        courses = r.json()
        faculty1_courses = [c for c in courses if c.get('faculty_id') == 1]
        print(f"Total courses for Faculty 1: {len(faculty1_courses)}")
        for c in faculty1_courses[:5]:
            print(f"  - Course {c['course_id']}: {c['course_name']} ({c['course_code']})")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 4: Get students in a course
print("\n4. GET /enrollments - Check enrollments")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/enrollments")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        enrollments = r.json()
        course1_enrollments = [e for e in enrollments if e.get('course_id') == 1]
        print(f"Total students in Course 1: {len(course1_enrollments)}")
        for e in course1_enrollments[:3]:
            print(f"  - Student ID {e['student_id']} enrolled in Course {e['course_id']}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 5: Get marks for courses
print("\n5. GET /marks - Check marks data")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/marks")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        marks = r.json()
        course1_marks = [m for m in marks if m.get('course_id') == 1]
        print(f"Total marks records for Course 1: {len(course1_marks)}")
        for m in course1_marks[:3]:
            print(f"  - Student {m['student_id']}: Total {m.get('total_marks', 0)}, Grade {m.get('grade_letter', 'N/A')}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 6: Get attendance
print("\n6. GET /attendances - Check attendance data")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/attendances")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        attendances = r.json()
        print(f"Total attendance records: {len(attendances)}")
        for a in attendances[:3]:
            print(f"  - Student {a['student_id']}, Course {a['course_id']}, Date: {a.get('date', 'N/A')}, Status: {a.get('status', 'N/A')}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 7: Get notifications
print("\n7. GET /notifications - Check notifications")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/notifications")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        notifications = r.json()
        print(f"Total notifications: {len(notifications)}")
        for n in notifications[:3]:
            print(f"  - ID {n.get('notification_id', 'N/A')}: {n.get('title', 'N/A')}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 8: Get feedback
print("\n8. GET /feedbacks - Check feedback data")
print("-" * 80)
try:
    r = requests.get(f"{API_BASE}/feedbacks")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        feedbacks = r.json()
        print(f"Total feedback records: {len(feedbacks)}")
        for f in feedbacks[:3]:
            print(f"  - Feedback {f.get('feedback_id', 'N/A')}: Course {f.get('course_id', 'N/A')}, Student {f.get('student_id', 'N/A')}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 80)
print("API TEST COMPLETE")
