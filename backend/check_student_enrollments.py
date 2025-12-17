from database import engine
from sqlalchemy import text

# Check student 1 (asjal) enrollments
with engine.connect() as conn:
    # Get student info
    student = conn.execute(text("SELECT student_id, student_name, username FROM students WHERE username = 'asjal'")).fetchone()
    print(f"Student: {student[1]} (ID: {student[0]}, Username: {student[2]})")
    print("=" * 60)
    
    # Get enrollments
    result = conn.execute(text("""
        SELECT e.enrollment_id, e.course_id, c.course_name, c.course_code, e.enrolled_date
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.student_id = :sid
        ORDER BY e.course_id
    """), {"sid": student[0]})
    
    enrollments = result.fetchall()
    print(f"\nTotal enrollments: {len(enrollments)}\n")
    
    for eid, cid, cname, ccode, edate in enrollments:
        print(f"Enrollment {eid}: Course {cid} - {cname} ({ccode}) - Enrolled: {edate}")
    
    # Check marks
    print("\n" + "=" * 60)
    print("Marks records for this student:")
    print("=" * 60)
    
    marks_result = conn.execute(text("""
        SELECT m.mark_id, m.course_id, c.course_name, m.total_marks, m.grade_letter
        FROM marks m
        JOIN courses c ON m.course_id = c.course_id
        WHERE m.student_id = :sid
        ORDER BY m.course_id
    """), {"sid": student[0]})
    
    marks = marks_result.fetchall()
    print(f"Total marks records: {len(marks)}\n")
    
    for mid, cid, cname, total, grade in marks:
        print(f"Mark {mid}: Course {cid} - {cname} - Total: {total}, Grade: {grade}")
