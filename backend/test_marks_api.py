import requests
import time

# Wait for server
time.sleep(3)

print('Testing marks endpoints:\n')

# Test student marks for a specific course
print('1. Testing /marks/student/1/course/2')
r = requests.get('http://127.0.0.1:8000/marks/student/1/course/2')
print(f'   Status: {r.status_code}')
if r.status_code == 200:
    data = r.json()
    print(f'   Response type: {type(data)}')
    if isinstance(data, list):
        print(f'   Count: {len(data)}')
        if data:
            print(f'   Sample: {data[0]}')
    else:
        print(f'   Data: {data}')
else:
    print(f'   Error: {r.text[:300]}')

# Test all marks for a course
print('\n2. Testing /marks/course/2')
r2 = requests.get('http://127.0.0.1:8000/marks/course/2')
print(f'   Status: {r2.status_code}')
if r2.status_code == 200:
    data2 = r2.json()
    print(f'   Count: {len(data2)}')
    if data2:
        print(f'   Sample: {data2[0]}')
else:
    print(f'   Error: {r2.text[:300]}')

# Test courses endpoint
print('\n3. Testing /courses endpoint')
r3 = requests.get('http://127.0.0.1:8000/courses')
print(f'   Status: {r3.status_code}')
if r3.status_code == 200:
    courses = r3.json()
    course = next((c for c in courses if c['course_id'] == 2), None)
    if course:
        print(f'   Course 2: {course["course_name"]} ({course["course_code"]})')
