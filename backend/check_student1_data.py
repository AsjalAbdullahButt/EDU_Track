from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("STUDENT 1 (asjal) DATA:")
    print("=" * 70)
    
    # Enrollments
    print("\nENROLLMENTS:")
    result = conn.execute(text("""
        SELECT e.course_id, c.course_name 
        FROM enrollment e
        JOIN course c ON e.course_id = c.course_id
        WHERE e.student_id = 1
        ORDER BY e.course_id
    """))
    enrollments = result.fetchall()
    print(f"Total: {len(enrollments)}")
    for cid, cname in enrollments:
        print(f"  Course {cid}: {cname}")
    
    # Grades
    print("\nGRADES:")
    result = conn.execute(text("""
        SELECT g.course_id, c.course_name, g.marks_obtained
        FROM grade g
        JOIN course c ON g.course_id = c.course_id
        WHERE g.student_id = 1
        ORDER BY g.course_id
    """))
    grades = result.fetchall()
    print(f"Total: {len(grades)}")
    for cid, cname, marks in grades:
        print(f"  Course {cid}: {cname} - Marks: {marks}")
    
    # Marks
    print("\nMARKS:")
    result = conn.execute(text("""
        SELECT m.course_id, c.course_name, m.total_marks, m.grade_letter
        FROM marks m
        JOIN course c ON m.course_id = c.course_id
        WHERE m.student_id = 1
        ORDER BY m.course_id
    """))
    marks = result.fetchall()
    print(f"Total: {len(marks)}")
    for cid, cname, total, grade in marks:
        print(f"  Course {cid}: {cname} - Total: {total}, Grade: {grade}")
