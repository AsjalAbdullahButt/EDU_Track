import requests
import json

print("=" * 50)
print("Testing Marks API")
print("=" * 50)

# Test marks endpoint
url = "http://127.0.0.1:8000/marks/student/1/course/2"
print(f"\nGET {url}")

try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nResponse type: {type(data)}")
        print(f"Number of records: {len(data)}")
        
        if data:
            mark = data[0]
            print(f"\nFirst record:")
            print(f"  Student ID: {mark['student_id']}")
            print(f"  Course ID: {mark['course_id']}")
            print(f"  Quiz Total: {mark['quiz_total']}")
            print(f"  Assignment Total: {mark['assignment_total']}")
            print(f"  Midterm 1: {mark['midterm1']}")
            print(f"  Midterm 2: {mark['midterm2']}")
            print(f"  Final Exam: {mark['final_exam']}")
            print(f"  Total Marks: {mark['total_marks']}")
            print(f"  Grade: {mark['grade_letter']}")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error: {str(e)}")

# Test courses endpoint
print("\n" + "=" * 50)
url2 = "http://127.0.0.1:8000/courses"
print(f"GET {url2}")

try:
    response2 = requests.get(url2)
    print(f"Status: {response2.status_code}")
    
    if response2.status_code == 200:
        courses = response2.json()
        course = next((c for c in courses if c['course_id'] == 2), None)
        if course:
            print(f"\nCourse 2 details:")
            print(f"  Name: {course['course_name']}")
            print(f"  Code: {course['course_code']}")
            
except Exception as e:
    print(f"Error: {str(e)}")
