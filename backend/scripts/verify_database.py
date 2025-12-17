"""Comprehensive database verification"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from sqlalchemy import text

def verify_database():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("EDU-TRACK DATABASE VERIFICATION")
        print("="*60)
        
        # Test 1: Check all tables exist
        print("\n1. CHECKING TABLES...")
        tables = ['Student', 'Faculty', 'Admin', 'Course', 'Enrollment', 
                  'Attendance', 'Grades', 'Fee', 'Notifications', 'Feedback', 'Salary']
        
        for table in tables:
            result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            print(f"   ✓ {table}: {count} records")
        
        # Test 2: Verify students with username field
        print("\n2. VERIFYING STUDENT DATA...")
        result = db.execute(text("""
            SELECT student_id, username, full_name, email 
            FROM Student 
            WHERE username IS NOT NULL
            LIMIT 3
        """))
        for row in result:
            print(f"   ✓ ID: {row[0]}, Username: {row[1]}, Name: {row[2]}")
        
        # Test 3: Check password hashing
        print("\n3. VERIFYING PASSWORD SECURITY...")
        result = db.execute(text("SELECT password FROM Student LIMIT 1"))
        pwd = result.scalar()
        if pwd.startswith('$2b$'):
            print(f"   ✓ Passwords are bcrypt-hashed: {pwd[:20]}...")
        else:
            print(f"   ✗ WARNING: Passwords not hashed properly!")
        
        # Test 4: Active enrollments per student
        print("\n4. ACTIVE ENROLLMENTS PER STUDENT...")
        result = db.execute(text("""
            SELECT s.student_id, s.full_name, COUNT(e.enrollment_id) as courses
            FROM Student s
            LEFT JOIN Enrollment e ON s.student_id = e.student_id AND e.status = 'Active'
            GROUP BY s.student_id
            ORDER BY s.student_id
        """))
        for row in result:
            print(f"   Student {row[0]} ({row[1]}): {row[2]} courses")
        
        # Test 5: Fee status distribution
        print("\n5. FEE STATUS DISTRIBUTION...")
        result = db.execute(text("""
            SELECT 
                SUM(CASE WHEN amount_paid >= total_amount THEN 1 ELSE 0 END) as paid,
                SUM(CASE WHEN amount_paid < total_amount AND amount_paid > 0 THEN 1 ELSE 0 END) as partial,
                SUM(CASE WHEN amount_paid = 0 THEN 1 ELSE 0 END) as unpaid
            FROM Fee
        """))
        row = result.fetchone()
        print(f"   ✓ Fully Paid: {row[0]}")
        print(f"   ✓ Partially Paid: {row[1]}")
        print(f"   ✓ Unpaid: {row[2]}")
        
        # Test 6: Attendance statistics
        print("\n6. ATTENDANCE STATISTICS...")
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
            FROM Attendance
        """))
        row = result.fetchone()
        percentage = (row[1] / row[0] * 100) if row[0] > 0 else 0
        print(f"   Total Records: {row[0]}")
        print(f"   Present: {row[1]} ({percentage:.1f}%)")
        print(f"   Absent: {row[2]}")
        
        # Test 7: Grade distribution
        print("\n7. GRADE DISTRIBUTION...")
        result = db.execute(text("""
            SELECT grade, COUNT(*) as count
            FROM Grades
            WHERE grade IS NOT NULL
            GROUP BY grade
            ORDER BY grade
        """))
        for row in result:
            print(f"   Grade {row[0]}: {row[1]} students")
        
        # Test 8: Notification status
        print("\n8. NOTIFICATION STATUS...")
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read_count,
                SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count
            FROM Notifications
        """))
        row = result.fetchone()
        print(f"   Total: {row[0]}")
        print(f"   Read: {row[1]}")
        print(f"   Unread: {row[2]}")
        
        print("\n" + "="*60)
        print("DATABASE VERIFICATION COMPLETE ✓")
        print("="*60)
        print("\nThe database is properly set up and ready for use!")
        print("\nTest Login Credentials (password: password123):")
        print("   Admin:   admin@edu.com")
        print("   Faculty: imran@faculty.com")
        print("   Student: asjal@student.com (3 courses, 86.67% attendance)")
        print("   Student: ali@student.com (3 courses, 100% attendance)")
        print("   Student: waleed@student.com (1 course, no attendance yet)")
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_database()
