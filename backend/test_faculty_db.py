import sys
sys.path.insert(0, r'c:\Users\user\Desktop\EDU_Track\EDU_Track\backend')

from database import engine
from sqlalchemy import text

print("FACULTY DATABASE ANALYSIS:")
print("=" * 80)

with engine.connect() as conn:
    # Faculty table structure
    print("\n1. FACULTY TABLE STRUCTURE:")
    print("-" * 80)
    result = conn.execute(text("DESCRIBE faculty"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    # Sample faculty data
    print("\n2. FACULTY RECORDS:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT faculty_id, name, email, department, contact
        FROM faculty
        ORDER BY faculty_id
        LIMIT 5
    """))
    faculties = result.fetchall()
    print(f"Total records to show: {len(faculties)}")
    for row in faculties:
        print(f"  ID {row[0]}: {row[1]} - {row[2]} - Dept: {row[3]}")
    
    # Courses with faculty
    print("\n3. COURSES ASSIGNED TO FACULTY:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT c.course_id, c.course_name, c.course_code, c.faculty_id, f.name
        FROM course c
        LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
        ORDER BY c.course_id
        LIMIT 15
    """))
    for cid, cname, ccode, fid, fname in result:
        faculty_info = fname if fname else "Not Assigned"
        print(f"  Course {cid} ({ccode}): {cname} - Faculty: {faculty_info}")
    
    # Attendance records
    print("\n4. ATTENDANCE TABLE SAMPLE:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT attendance_id, student_id, course_id, attendance_date, status
        FROM attendance
        LIMIT 5
    """))
    for aid, sid, cid, date, status in result:
        print(f"  Attendance {aid}: Student {sid}, Course {cid}, Date: {date}, Status: {status}")
    
    # Notifications
    print("\n5. NOTIFICATIONS TABLE SAMPLE:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT notification_id, title, message, created_by, created_at
        FROM notification
        LIMIT 5
    """))
    for nid, title, msg, creator, created in result:
        print(f"  Notification {nid}: {title} - Created by: {creator}")
    
    # Marks by faculty courses
    print("\n6. MARKS FOR FACULTY COURSES:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT m.mark_id, m.student_id, m.course_id, c.course_name, m.total_marks, m.grade_letter, c.faculty_id
        FROM marks m
        JOIN course c ON m.course_id = c.course_id
        WHERE c.faculty_id IS NOT NULL
        LIMIT 10
    """))
    for mid, sid, cid, cname, total, grade, fid in result:
        print(f"  Mark {mid}: Student {sid}, Course {cid} ({cname}), Total: {total}, Grade: {grade}, Faculty: {fid}")

print("\n" + "=" * 80)
print("DATABASE ANALYSIS COMPLETE")
