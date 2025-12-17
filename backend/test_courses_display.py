import requests
import json

# Simulate being logged in as student 1 (Asjal)
print("Testing courses page data flow:\n")

# Step 1: Get enrollments for student 1
print("1. Fetching enrollments...")
r = requests.get('http://127.0.0.1:8000/enrollments')
if r.status_code == 200:
    all_enrollments = r.json()
    student_enrollments = [e for e in all_enrollments if e['student_id'] == 1]
    print(f"   ✓ Found {len(student_enrollments)} enrollments for student 1")
else:
    print(f"   ✗ Failed: {r.status_code}")

# Step 2: Get all courses
print("\n2. Fetching courses...")
r = requests.get('http://127.0.0.1:8000/courses')
if r.status_code == 200:
    all_courses = r.json()
    print(f"   ✓ Found {len(all_courses)} total courses")
else:
    print(f"   ✗ Failed: {r.status_code}")

# Step 3: Get all faculty
print("\n3. Fetching faculty...")
r = requests.get('http://127.0.0.1:8000/faculties')
if r.status_code == 200:
    all_faculty = r.json()
    print(f"   ✓ Found {len(all_faculty)} faculty members")
else:
    print(f"   ✗ Failed: {r.status_code}")
    all_faculty = []

# Step 4: Build enrolled courses with details
print("\n4. Building course display data...")
enrolled_courses = []
for enrollment in student_enrollments:
    course = next((c for c in all_courses if c['course_id'] == enrollment['course_id']), None)
    if course:
        instructor = next((f for f in all_faculty if f['faculty_id'] == course.get('faculty_id')), None)
        enrolled_courses.append({
            'course_code': course['course_code'],
            'course_name': course['course_name'],
            'credit_hours': course['credit_hours'],
            'instructor_name': instructor['name'] if instructor else 'Not Assigned',
            'department': instructor['department'] if instructor else 'N/A',
            'enrollment_id': enrollment['enrollment_id']
        })

print(f"   ✓ Built {len(enrolled_courses)} course records\n")

# Display the results
print("5. Course data that will be displayed:")
print("-" * 80)
for course in enrolled_courses:
    print(f"   {course['course_code']}: {course['course_name']}")
    print(f"   Credits: {course['credit_hours']} | Instructor: {course['instructor_name']}")
    print(f"   Department: {course['department']}")
    print("-" * 80)
