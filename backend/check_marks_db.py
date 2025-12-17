from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT student_id, course_id FROM marks ORDER BY student_id, course_id"))
    rows = result.fetchall()
    
    print("All marks in database:")
    print("=" * 50)
    print(f"Total records: {len(rows)}\n")
    
    student_courses = {}
    for sid, cid in rows:
        if sid not in student_courses:
            student_courses[sid] = []
        student_courses[sid].append(cid)
    
    for sid in sorted(student_courses.keys()):
        courses = sorted(student_courses[sid])
        print(f"Student {sid}: Has marks for courses {courses}")
