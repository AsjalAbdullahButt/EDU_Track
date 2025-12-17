import requests
import json

print("Checking all marks in database...")
print("=" * 50)

try:
    response = requests.get('http://127.0.0.1:8000/marks')
    if response.status_code == 200:
        marks = response.json()
        print(f"Total marks records: {len(marks)}\n")
        
        # Group by student
        student_courses = {}
        for m in marks:
            sid = m['student_id']
            cid = m['course_id']
            if sid not in student_courses:
                student_courses[sid] = []
            student_courses[sid].append(cid)
        
        for sid in sorted(student_courses.keys()):
            courses = sorted(student_courses[sid])
            print(f"Student {sid}: Has marks for courses {courses}")
            
    else:
        print(f"Error: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")
