"""Test dashboard stats endpoint directly"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from routers.student import get_student_dashboard_stats

def test_endpoint():
    db = SessionLocal()
    try:
        # Test with student ID 1 (Asjal Abdullah who has 3 active enrollments)
        print("\n=== Testing dashboard stats endpoint for Student ID 1 ===\n")
        result = get_student_dashboard_stats(student_id=1, db=db)
        
        print(f"Enrolled Courses: {result['enrolled_courses']}")
        print(f"Attendance: {result['attendance_percentage']}% ({result['present_count']}/{result['total_attendance_records']})")
        print(f"CGPA: {result['cgpa']}")
        print(f"Fee Status: {result['fee_status']}")
        print(f"Fee Balance: {result['fee_balance']}")
        print(f"\nFull result:")
        for key, value in result.items():
            print(f"  {key}: {value}")
            
        # Test with student ID 16 (Waleed who has 1 active enrollment)
        print("\n\n=== Testing dashboard stats endpoint for Student ID 16 ===\n")
        result2 = get_student_dashboard_stats(student_id=16, db=db)
        
        print(f"Enrolled Courses: {result2['enrolled_courses']}")
        print(f"Attendance: {result2['attendance_percentage']}% ({result2['present_count']}/{result2['total_attendance_records']})")
        print(f"CGPA: {result2['cgpa']}")
        print(f"Fee Status: {result2['fee_status']}")
        print(f"\nFull result:")
        for key, value in result2.items():
            print(f"  {key}: {value}")
    
    finally:
        db.close()

if __name__ == "__main__":
    test_endpoint()
