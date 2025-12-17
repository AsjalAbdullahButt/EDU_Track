import requests

print('Testing enrollments endpoint:')
r = requests.get('http://127.0.0.1:8000/enrollments')
print(f'Status: {r.status_code}')
if r.status_code == 200:
    data = r.json()
    print(f'Total enrollments: {len(data)}')
    if data:
        print(f'Sample enrollment: {data[0]}')
else:
    print(f'Error: {r.text}')

print('\nTesting courses endpoint:')
r2 = requests.get('http://127.0.0.1:8000/courses')
print(f'Status: {r2.status_code}')
if r2.status_code == 200:
    data2 = r2.json()
    print(f'Total courses: {len(data2)}')
    if data2:
        print(f'Sample course: {data2[0]}')
else:
    print(f'Error: {r2.text}')
