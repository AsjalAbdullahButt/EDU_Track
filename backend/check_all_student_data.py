from database import engine
from sqlalchemy import text

# Check student 1 (asjal)
with engine.connect() as conn:
    # Get student info
    student = conn.execute(text("SELECT student_id, full_name, username FROM student WHERE username = 'asjal'")).fetchone()
    print(f"Student: {student[1]} (ID: {student[0]}, Username: {student[2]})")
    print("=" * 60)
    
    # Check GRADES table
    print("\nGRADES TABLE:")
    print("-" * 60)
    grades_result = conn.execute(text("""
        SELECT g.grade_id, g.course_id, c.course_name, g.marks_obtained, g.semester
        FROM grades g
        JOIN courses c ON g.course_id = c.course_id
        WHERE g.student_id = :sid
        ORDER BY g.course_id
    """), {"sid": student[0]})
    
    grades = grades_result.fetchall()
    print(f"Total records in grades table: {len(grades)}")
    for gid, cid, cname, marks, sem in grades:
        print(f"  Grade {gid}: Course {cid} - {cname} - Marks: {marks}, Semester: {sem}")
    
    # Check MARKS table
    print("\n" + "=" * 60)
    print("MARKS TABLE:")
    print("-" * 60)
    marks_result = conn.execute(text("""
        SELECT m.mark_id, m.course_id, c.course_name, m.total_marks, m.grade_letter, m.semester
        FROM marks m
        JOIN courses c ON m.course_id = c.course_id
        WHERE m.student_id = :sid
        ORDER BY m.course_id
    """), {"sid": student[0]})
    
    marks = marks_result.fetchall()
    print(f"Total records in marks table: {len(marks)}")
    for mid, cid, cname, total, grade, sem in marks:
        print(f"  Mark {mid}: Course {cid} - {cname} - Total: {total}, Grade: {grade}, Semester: {sem}")
    
    # Check ENROLLMENTS
    print("\n" + "=" * 60)
    print("ENROLLMENTS TABLE:")
    print("-" * 60)
    enroll_result = conn.execute(text("""
        SELECT e.enrollment_id, e.course_id, c.course_name, e.enrolled_date
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.student_id = :sid
        ORDER BY e.course_id
    """), {"sid": student[0]})
    
    enrollments = enroll_result.fetchall()
    print(f"Total enrollments: {len(enrollments)}")
    for eid, cid, cname, edate in enrollments:
        print(f"  Enrollment {eid}: Course {cid} - {cname} - Enrolled: {edate}")
