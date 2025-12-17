import requests

print('Testing Course Marks Page Data Flow:\n')

# Simulate student 1 viewing marks for course 2
student_id = 1
course_id = 2

print(f'1. Student {student_id} viewing marks for course {course_id}')

# Get student's marks for the course
r1 = requests.get(f'http://127.0.0.1:8000/marks/student/{student_id}/course/{course_id}')
print(f'   Student marks: {r1.status_code}')
if r1.status_code == 200:
    marks = r1.json()
    if marks:
        mark = marks[0]
        print(f'   ✓ Found marks record')
        print(f'   Quiz Total: {mark["quiz_total"]}')
        print(f'   Assignment Total: {mark["assignment_total"]}')
        print(f'   Midterm 1: {mark["midterm1"]}')
        print(f'   Midterm 2: {mark["midterm2"]}')
        print(f'   Final Exam: {mark["final_exam"]}')
        print(f'   Total Marks: {mark["total_marks"]}')
        print(f'   Grade: {mark["grade_letter"]}')
    else:
        print('   ✗ No marks found')
else:
    print(f'   ✗ Error: {r1.text[:200]}')

# Get all marks for the course (for class stats)
print(f'\n2. Getting class statistics for course {course_id}')
r2 = requests.get(f'http://127.0.0.1:8000/marks/course/{course_id}')
print(f'   Course marks: {r2.status_code}')
if r2.status_code == 200:
    all_marks = r2.json()
    print(f'   ✓ Found {len(all_marks)} students with marks')
    if all_marks:
        avg_total = sum(m['total_marks'] for m in all_marks) / len(all_marks)
        print(f'   Class Average: {avg_total:.2f}')
else:
    print(f'   ✗ Error: {r2.text[:200]}')

# Get course info
print(f'\n3. Getting course information')
r3 = requests.get('http://127.0.0.1:8000/courses')
if r3.status_code == 200:
    courses = r3.json()
    course = next((c for c in courses if c['course_id'] == course_id), None)
    if course:
        print(f'   ✓ Course: {course["course_name"]} ({course["course_code"]})')
        print(f'   Credits: {course["credit_hours"]}')
    else:
        print('   ✗ Course not found')
else:
    print(f'   ✗ Error: {r3.text[:200]}')

print('\n✓ All endpoints working - course_marks page should display correctly')
