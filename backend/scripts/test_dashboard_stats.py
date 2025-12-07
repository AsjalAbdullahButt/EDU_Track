"""Test script to check dashboard stats endpoint"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models import Student, Enrollment, Attendance, Grades, Fee

def test_dashboard_stats():
    db = SessionLocal()
    try:
        # Get all students
        students = db.query(Student).all()
        print(f"\n=== Found {len(students)} students ===\n")
        
        for student in students:
            print(f"Student ID: {student.student_id}")
            print(f"Name: {student.full_name}")
            print(f"Email: {student.email}")
            print(f"Username: {student.username}")
            
            # Check enrollments
            enrollments = db.query(Enrollment).filter(
                Enrollment.student_id == student.student_id,
                Enrollment.status == "Active"
            ).all()
            print(f"Active Enrollments: {len(enrollments)}")
            for enr in enrollments:
                print(f"  - Course ID: {enr.course_id}, Status: {enr.status}")
            
            # Check all enrollments (including non-active)
            all_enrollments = db.query(Enrollment).filter(
                Enrollment.student_id == student.student_id
            ).all()
            print(f"Total Enrollments (all statuses): {len(all_enrollments)}")
            for enr in all_enrollments:
                print(f"  - Course ID: {enr.course_id}, Status: {enr.status}")
            
            # Check attendance
            attendance = db.query(Attendance).filter(
                Attendance.student_id == student.student_id
            ).all()
            print(f"Attendance Records: {len(attendance)}")
            
            # Check grades
            grades = db.query(Grades).filter(
                Grades.student_id == student.student_id
            ).all()
            print(f"Grade Records: {len(grades)}")
            for g in grades:
                print(f"  - Course ID: {g.course_id}, Grade: {g.grade}")
            
            # Check fees
            fees = db.query(Fee).filter(
                Fee.student_id == student.student_id
            ).all()
            print(f"Fee Records: {len(fees)}")
            for f in fees:
                print(f"  - Total: {f.total_amount}, Paid: {f.amount_paid}, Status: {f.status}")
            
            print("\n" + "="*50 + "\n")
    
    finally:
        db.close()

if __name__ == "__main__":
    test_dashboard_stats()
