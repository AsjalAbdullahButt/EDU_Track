"""Quick test for Student ID 7"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from routers.student import get_student_dashboard_stats

def test_student_7():
    db = SessionLocal()
    try:
        print('\n=== Student ID 7 (Waleed Ahmad) Dashboard Stats ===\n')
        stats = get_student_dashboard_stats(7, db)
        
        print(f"Enrolled Courses: {stats['enrolled_courses']}")
        print(f"Attendance: {stats['attendance_percentage']}%")
        print(f"CGPA: {stats['cgpa']}")
        print(f"Fee Status: {stats['fee_status']}")
        print(f"Fee Balance: PKR {stats['fee_balance']}")
        print(f"\nThis student should show:")
        print("- 1 Active Course")
        print("- N/A or 0% Attendance (no records yet)")
        print("- N/A CGPA (no grades yet)")
        print("- Unpaid Fee Status")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_student_7()
