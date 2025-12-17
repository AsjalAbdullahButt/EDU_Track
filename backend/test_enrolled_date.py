import requests
import time

time.sleep(2)

r = requests.get('http://127.0.0.1:8000/enrollments')
if r.status_code == 200:
    enrollments = [e for e in r.json() if e['student_id'] == 1]
    print('Student 1 enrollments with dates:')
    for e in enrollments[:3]:
        print(f'  Course {e["course_id"]}: {e.get("enrolled_date", "MISSING")}')
else:
    print(f'Error: {r.status_code}')
