import requests
import json
import time

# Wait for server to start
time.sleep(3)

print('='*80)
print('COMPREHENSIVE DATABASE VERIFICATION')
print('='*80)

# 1. Check all marks in database
print('\n1. CHECKING MARKS DATABASE:')
r = requests.get('http://127.0.0.1:8000/marks')
if r.status_code == 200:
    all_marks = r.json()
    print(f'   ✓ Total marks records: {len(all_marks)}')
    print('\n   Sample records:')
    for mark in all_marks[:5]:
        print(f'   - Student {mark["student_id"]}, Course {mark["course_id"]}:')
        print(f'     Quiz: {mark["quiz_total"]}, Assignment: {mark["assignment_total"]}')
        print(f'     Midterm1: {mark["midterm1"]}, Midterm2: {mark["midterm2"]}, Final: {mark["final_exam"]}')
        print(f'     Total: {mark["total_marks"]}, Grade: {mark["grade_letter"]}')
else:
    print(f'   ✗ Error: {r.status_code}')

# 2. Verify student 1's marks for different courses
print('\n2. STUDENT 1 MARKS BY COURSE:')
r = requests.get('http://127.0.0.1:8000/marks/student/1')
if r.status_code == 200:
    student_marks = r.json()
    print(f'   ✓ Student 1 has {len(student_marks)} course marks')
    for mark in student_marks:
        print(f'   - Course {mark["course_id"]}: {mark["total_marks"]} ({mark["grade_letter"]})')
else:
    print(f'   ✗ Error: {r.status_code}')

# 3. Check specific student-course combination
print('\n3. DETAILED CHECK: Student 1, Course 2:')
r = requests.get('http://127.0.0.1:8000/marks/student/1/course/2')
if r.status_code == 200:
    marks = r.json()
    if marks:
        mark = marks[0]
        print(f'   ✓ Marks found')
        print(f'   Quiz 1: {mark["quiz1"]}')
        print(f'   Quiz 2: {mark["quiz2"]}')
        print(f'   Quiz 3: {mark["quiz3"]}')
        print(f'   Quiz Total: {mark["quiz_total"]}')
        print(f'   Assignment 1: {mark["assignment1"]}')
        print(f'   Assignment 2: {mark["assignment2"]}')
        print(f'   Assignment 3: {mark["assignment3"]}')
        print(f'   Assignment Total: {mark["assignment_total"]}')
        print(f'   Midterm 1: {mark["midterm1"]}')
        print(f'   Midterm 2: {mark["midterm2"]}')
        print(f'   Final Exam: {mark["final_exam"]}')
        print(f'   Total Marks: {mark["total_marks"]}')
        print(f'   Grade: {mark["grade_letter"]}')
        
        # Verify calculation
        calculated_total = (float(mark["quiz_total"]) + float(mark["assignment_total"]) + 
                          float(mark["midterm1"]) + float(mark["midterm2"]) + float(mark["final_exam"]))
        print(f'\n   Verification:')
        print(f'   Calculated Total: {calculated_total}')
        print(f'   Database Total: {mark["total_marks"]}')
        print(f'   Match: {"✓" if abs(calculated_total - float(mark["total_marks"])) < 0.1 else "✗"}')
    else:
        print('   ✗ No marks found')
else:
    print(f'   ✗ Error: {r.status_code}')

# 4. Check course info
print('\n4. COURSE INFORMATION:')
r = requests.get('http://127.0.0.1:8000/courses')
if r.status_code == 200:
    courses = r.json()
    course = next((c for c in courses if c['course_id'] == 2), None)
    if course:
        print(f'   ✓ Course 2 found')
        print(f'   Name: {course["course_name"]}')
        print(f'   Code: {course["course_code"]}')
        print(f'   Credits: {course["credit_hours"]}')
else:
    print(f'   ✗ Error: {r.status_code}')

# 5. Check all marks for course 2 (for statistics)
print('\n5. CLASS STATISTICS FOR COURSE 2:')
r = requests.get('http://127.0.0.1:8000/marks/course/2')
if r.status_code == 200:
    course_marks = r.json()
    print(f'   ✓ Found {len(course_marks)} students in course')
    totals = [float(m["total_marks"]) for m in course_marks]
    print(f'   Average: {sum(totals)/len(totals):.2f}')
    print(f'   Minimum: {min(totals):.2f}')
    print(f'   Maximum: {max(totals):.2f}')
else:
    print(f'   ✗ Error: {r.status_code}')

print('\n' + '='*80)
print('VERIFICATION COMPLETE')
print('='*80)
