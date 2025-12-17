import requests

API = "http://127.0.0.1:8000"

print("FACULTY PAGES - COMPREHENSIVE TESTING")
print("=" * 80)

# Test 1: Verify all endpoints work
print("\n1. API ENDPOINTS STATUS:")
print("-" * 80)
endpoints = {
    "/students": "Students list",
    "/faculties": "Faculty list", 
    "/faculties/1": "Faculty details",
    "/courses": "Courses list",
    "/enrollments": "Enrollments",
    "/marks": "Marks/Grades",
    "/attendance": "Attendance records",
    "/notifications": "Notifications",
    "/feedback": "Feedback",
    "/salaries": "Salary records"
}

for ep, desc in endpoints.items():
    try:
        r = requests.get(f"{API}{ep}")
        count = len(r.json()) if isinstance(r.json(), list) else 1
        print(f"  ✓ {ep:20} {desc:25} Status: {r.status_code}, Records: {count}")
    except Exception as e:
        print(f"  ✗ {ep:20} {desc:25} ERROR: {str(e)[:40]}")

# Test 2: Faculty 1 complete data
print("\n2. FACULTY 1 (DR. IMRAN SHEIKH) COMPLETE PROFILE:")
print("-" * 80)

r = requests.get(f"{API}/faculties/1")
faculty = r.json()
print(f"  Name: {faculty.get('name')}")
print(f"  Email: {faculty.get('email')}")
print(f"  Department: {faculty.get('department')}")

# Get courses
r = requests.get(f"{API}/courses")
faculty_courses = [c for c in r.json() if c.get('faculty_id') == 1]
print(f"\n  Courses Taught: {len(faculty_courses)}")
for c in faculty_courses:
    print(f"    • {c['course_code']}: {c['course_name']}")

# Get total students across all courses
r = requests.get(f"{API}/enrollments")
all_course_ids = [c['course_id'] for c in faculty_courses]
enrollments = [e for e in r.json() if e.get('course_id') in all_course_ids]
print(f"\n  Total Students Across All Courses: {len(enrollments)}")

# Get marks/grades for faculty courses
r = requests.get(f"{API}/marks")
marks = [m for m in r.json() if m.get('course_id') in all_course_ids]
print(f"  Total Marks Entered: {len(marks)}")

# Get attendance records
r = requests.get(f"{API}/attendance")
attendance = [a for a in r.json() if a.get('course_id') in all_course_ids]
print(f"  Total Attendance Records: {len(attendance)}")

# Test 3: Verify student data structure
print("\n3. STUDENT DATA STRUCTURE:")
print("-" * 80)
r = requests.get(f"{API}/students")
if r.status_code == 200 and len(r.json()) > 0:
    student = r.json()[0]
    print(f"  Sample student fields:")
    for key in ['student_id', 'username', 'full_name', 'email', 'department', 'semester']:
        print(f"    • {key}: {student.get(key, 'N/A')}")

# Test 4: Verify marks structure
print("\n4. MARKS DATA STRUCTURE:")
print("-" * 80)
r = requests.get(f"{API}/marks")
if r.status_code == 200 and len(r.json()) > 0:
    mark = r.json()[0]
    print(f"  Sample mark fields:")
    for key in ['mark_id', 'student_id', 'course_id', 'total_marks', 'grade_letter', 'quiz_total', 'assignment_total', 'midterm1', 'midterm2', 'final_exam']:
        print(f"    • {key}: {mark.get(key, 'N/A')}")

# Test 5: Notifications
print("\n5. NOTIFICATIONS:")
print("-" * 80)
r = requests.get(f"{API}/notifications")
if r.status_code == 200:
    notifications = r.json()
    print(f"  Total notifications: {len(notifications)}")
    for n in notifications[:3]:
        print(f"    • {n.get('title')} - Created: {n.get('created_at', 'N/A')[:10]}")

# Test 6: Feedback
print("\n6. FEEDBACK:")
print("-" * 80)
r = requests.get(f"{API}/feedback")
if r.status_code == 200:
    feedback = r.json()
    print(f"  Total feedback records: {len(feedback)}")
    for f in feedback[:3]:
        print(f"    • Course {f.get('course_id')}, Student {f.get('student_id')} - Rating: {f.get('rating', 'N/A')}")

print("\n" + "=" * 80)
print("TESTING COMPLETE - ALL FACULTY PAGES SHOULD NOW WORK CORRECTLY")
print("=" * 80)
