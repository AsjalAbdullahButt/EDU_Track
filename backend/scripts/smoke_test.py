import sys
import requests
import random
import time

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def ok(resp):
    return 200 <= resp.status_code < 300

def try_json(r):
    try:
        return r.json()
    except Exception:
        return None

results = []
created = {}

print(f"Running smoke tests against: {BASE}")

# 1. GET root/index
try:
    r = requests.get(BASE + "/")
    results.append(("GET /", r.status_code))
    print("GET / ->", r.status_code)
except Exception as e:
    print("GET / failed:", e)
    sys.exit(1)

# 2. GET students
try:
    r = requests.get(BASE + "/students/")
    results.append(("GET /students/", r.status_code))
    print("GET /students/ ->", r.status_code)
except Exception as e:
    print("GET /students/ failed:", e)

# 3. Create a temporary student
timestamp = int(time.time())
email = f"smoketest{timestamp}@example.test"
payload = {
    "full_name": "Smoke Test User",
    "email": email,
    "password": "testpass123",
    "contact": "0000"
}
student_id = None
try:
    r = requests.post(BASE + "/students/", json=payload, timeout=10)
    print("POST /students/ ->", r.status_code)
    if ok(r):
        data = try_json(r)
        student_id = data.get('student_id') if isinstance(data, dict) else None
        created['student_id'] = student_id
        print(" Created student id:", student_id)
    else:
        print(" POST response:", r.text[:200])
except Exception as e:
    print("POST /students/ failed:", e)

# 4. Login with created student
if student_id:
    try:
        r = requests.post(BASE + "/auth/login", json={"email": email, "password": "testpass123"})
        print("POST /auth/login ->", r.status_code)
        if ok(r):
            print(" Login response:", try_json(r))
    except Exception as e:
        print("POST /auth/login failed:", e)

# 5. Get courses
try:
    r = requests.get(BASE + "/courses/")
    print("GET /courses/ ->", r.status_code)
    results.append(("GET /courses/", r.status_code))
except Exception as e:
    print("GET /courses/ failed:", e)

# 6. Create a temporary course
course_id = None
try:
    cp = {"course_name": "Smoke Course", "course_code": f"SMK{timestamp}", "credit_hours": 3}
    r = requests.post(BASE + "/courses/", json=cp)
    print("POST /courses/ ->", r.status_code)
    if ok(r):
        d = try_json(r)
        course_id = d.get('course_id') if isinstance(d, dict) else None
        created['course_id'] = course_id
        print(" Created course id:", course_id)
except Exception as e:
    print("POST /courses/ failed:", e)

# 7. Enroll student in course
enrollment_id = None
if student_id and course_id:
    try:
        ep = {"student_id": student_id, "course_id": course_id, "semester": 1}
        r = requests.post(BASE + "/enrollments/", json=ep)
        print("POST /enrollments/ ->", r.status_code)
        if ok(r):
            d = try_json(r)
            enrollment_id = d.get('enrollment_id') if isinstance(d, dict) else None
            created['enrollment_id'] = enrollment_id
            print(" Created enrollment id:", enrollment_id)
    except Exception as e:
        print("POST /enrollments/ failed:", e)

# 8. Post attendance
attendance_id = None
if student_id and course_id:
    try:
        ap = {"student_id": student_id, "course_id": course_id, "date": time.strftime('%Y-%m-%d'), "status": "Present"}
        r = requests.post(BASE + "/attendance/", json=ap)
        print("POST /attendance/ ->", r.status_code)
        if ok(r):
            d = try_json(r)
            attendance_id = d.get('attendance_id') if isinstance(d, dict) else None
            created['attendance_id'] = attendance_id
            print(" Created attendance id:", attendance_id)
    except Exception as e:
        print("POST /attendance/ failed:", e)

# 9. Post grade
grade_id = None
if student_id and course_id:
    try:
        gp = {"student_id": student_id, "course_id": course_id, "marks_obtained": 85.5, "grade": "A", "semester": 1}
        r = requests.post(BASE + "/grades/", json=gp)
        print("POST /grades/ ->", r.status_code)
        if ok(r):
            d = try_json(r)
            grade_id = d.get('grade_id') if isinstance(d, dict) else None
            created['grade_id'] = grade_id
            print(" Created grade id:", grade_id)
    except Exception as e:
        print("POST /grades/ failed:", e)

# 10. Post fee
fee_id = None
if student_id:
    try:
        fp = {"student_id": student_id, "total_amount": 1000.0, "amount_paid": 0.0}
        r = requests.post(BASE + "/fees/", json=fp)
        print("POST /fees/ ->", r.status_code)
        if ok(r):
            d = try_json(r)
            fee_id = d.get('fee_id') if isinstance(d, dict) else None
            created['fee_id'] = fee_id
            print(" Created fee id:", fee_id)
    except Exception as e:
        print("POST /fees/ failed:", e)

# 11. Post notification
notif_id = None
try:
    np = {"sender_id": None, "recipient_id": student_id, "message": "Smoke test notification", "type": "info"}
    r = requests.post(BASE + "/notifications/", json=np)
    print("POST /notifications/ ->", r.status_code)
    if ok(r):
        d = try_json(r)
        notif_id = d.get('notification_id') if isinstance(d, dict) else None
        created['notification_id'] = notif_id
        print(" Created notification id:", notif_id)
except Exception as e:
    print("POST /notifications/ failed:", e)

# Summary
print("\nSmoke test summary — created:", created)
print("Results (sample):")
for name, code in results:
    print(f" {name}: {code}")

# Attempt cleanup: delete created objects where possible
print("\nAttempting cleanup...")
if 'notification_id' in created and created['notification_id']:
    try:
        r = requests.delete(BASE + f"/notifications/{created['notification_id']}")
        print("DELETE notification ->", r.status_code)
    except Exception:
        pass

if 'fee_id' in created and created['fee_id']:
    try:
        r = requests.delete(BASE + f"/fees/{created['fee_id']}")
        print("DELETE fee ->", r.status_code)
    except Exception:
        pass

if 'grade_id' in created and created['grade_id']:
    try:
        r = requests.delete(BASE + f"/grades/{created['grade_id']}")
        print("DELETE grade ->", r.status_code)
    except Exception:
        pass

if 'attendance_id' in created and created['attendance_id']:
    try:
        r = requests.delete(BASE + f"/attendance/{created['attendance_id']}")
        print("DELETE attendance ->", r.status_code)
    except Exception:
        pass

if 'enrollment_id' in created and created['enrollment_id']:
    try:
        r = requests.delete(BASE + f"/enrollments/{created['enrollment_id']}")
        print("DELETE enrollment ->", r.status_code)
    except Exception:
        pass

if 'course_id' in created and created['course_id']:
    try:
        r = requests.delete(BASE + f"/courses/{created['course_id']}")
        print("DELETE course ->", r.status_code)
    except Exception:
        pass

if 'student_id' in created and created['student_id']:
    try:
        r = requests.delete(BASE + f"/students/{created['student_id']}")
        print("DELETE student ->", r.status_code)
    except Exception:
        pass

print("Smoke test complete.")
