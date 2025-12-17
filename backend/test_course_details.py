import requests

# Test getting a specific enrollment's details with faculty info
print('Testing student 1 enrollments with course details:')
r = requests.get('http://127.0.0.1:8000/enrollments')
if r.status_code == 200:
    enrollments = [e for e in r.json() if e['student_id'] == 1]
    print(f'Student 1 has {len(enrollments)} enrollments')
    
    # Get all courses
    r2 = requests.get('http://127.0.0.1:8000/courses')
    if r2.status_code == 200:
        courses = r2.json()
        
        # Get all faculty
        r3 = requests.get('http://127.0.0.1:8000/faculty')
        if r3.status_code == 200:
            faculty = r3.json()
            
            print('\nEnrolled Courses with Faculty:')
            for e in enrollments[:3]:  # Show first 3
                course = next((c for c in courses if c['course_id'] == e['course_id']), None)
                if course:
                    fac = next((f for f in faculty if f['faculty_id'] == course.get('faculty_id')), None)
                    print(f"  - {course['course_name']} ({course['course_code']})")
                    print(f"    Faculty: {fac['name'] if fac else 'Not assigned'}")
                    print(f"    Credits: {course['credit_hours']}")
