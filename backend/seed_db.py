"""
Seed Database with Test Data
Creates sample users, courses, and data for testing
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Student, Faculty, Admin, Course, Enrollment, Fee, Notifications
from security import hash_password
from datetime import datetime, date, timedelta

def seed_database():
    db = SessionLocal()
    
    try:
        print("Seeding database with test data...")
        
        # Create admin
        admin = Admin(
            name="Admin User",
            email="admin@edu.track",
            password=hash_password("admin123"),
            role="admin"
        )
        db.add(admin)
        print("✓ Created admin user (email: admin@edu.track, password: admin123)")
        
        # Create faculty
        faculty1 = Faculty(
            name="Dr. John Smith",
            email="john.smith@edu.track",
            password=hash_password("pass123"),
            department="Computer Science",
            contact="555-0101",
            role="faculty"
        )
        
        faculty2 = Faculty(
            name="Dr. Sarah Johnson",
            email="sarah.johnson@edu.track",
            password=hash_password("pass123"),
            department="Mathematics",
            contact="555-0102",
            role="faculty"
        )
        
        db.add_all([faculty1, faculty2])
        db.flush()
        print("✓ Created 2 faculty members (password: pass123)")
        
        # Create courses
        course1 = Course(
            course_name="Introduction to Programming",
            course_code="CS101",
            credit_hours=3,
            faculty_id=faculty1.faculty_id
        )
        
        course2 = Course(
            course_name="Data Structures",
            course_code="CS201",
            credit_hours=4,
            faculty_id=faculty1.faculty_id
        )
        
        course3 = Course(
            course_name="Calculus I",
            course_code="MATH101",
            credit_hours=3,
            faculty_id=faculty2.faculty_id
        )
        
        db.add_all([course1, course2, course3])
        db.flush()
        print("✓ Created 3 courses")
        
        # Create students
        students = []
        for i in range(1, 6):
            student = Student(
                username=f"student{i}",
                full_name=f"Student {i}",
                email=f"student{i}@edu.track",
                password=hash_password("pass123"),
                gender="Male" if i % 2 == 0 else "Female",
                dob=date(2000, 1, i),
                department="Computer Science",
                semester=i % 4 + 1,
                contact=f"555-020{i}",
                address=f"{i}00 University Ave",
                role="student",
                profile_verified=True,
                verification_status="verified"
            )
            students.append(student)
            db.add(student)
        
        db.flush()
        print("✓ Created 5 students (email: student1-5@edu.track, password: pass123)")
        
        # Enroll students in courses
        enrollments = []
        for student in students:
            # Enroll each student in 2-3 courses
            enrollment1 = Enrollment(
                student_id=student.student_id,
                course_id=course1.course_id,
                semester=student.semester,
                status="Active"
            )
            enrollment2 = Enrollment(
                student_id=student.student_id,
                course_id=course2.course_id,
                semester=student.semester,
                status="Active"
            )
            enrollments.extend([enrollment1, enrollment2])
        
        db.add_all(enrollments)
        print("✓ Created course enrollments")
        
        # Create fee records
        for student in students:
            fee = Fee(
                student_id=student.student_id,
                total_amount=5000.00,
                amount_paid=2500.00 if student.student_id % 2 == 0 else 0,
                due_date=date.today() + timedelta(days=30),
                status="Paid" if student.student_id % 2 == 0 else "Pending"
            )
            db.add(fee)
        
        print("✓ Created fee records")
        
        # Create notifications
        for student in students:
            notif = Notifications(
                sender_id=admin.admin_id,
                recipient_id=student.student_id,
                student_id=student.student_id,
                title="Welcome to EDU Track",
                message=f"Welcome {student.full_name}! Your account has been activated.",
                date_sent=datetime.now(),
                created_at=datetime.now(),
                is_read=False,
                type="info"
            )
            db.add(notif)
        
        print("✓ Created notifications")
        
        db.commit()
        print("\n" + "="*50)
        print("Database seeded successfully!")
        print("="*50)
        print("\nTest Accounts:")
        print("\nAdmin:")
        print("  Email: admin@edu.track")
        print("  Password: admin123")
        print("\nFaculty:")
        print("  Email: john.smith@edu.track or sarah.johnson@edu.track")
        print("  Password: pass123")
        print("\nStudents:")
        print("  Email: student1@edu.track through student5@edu.track")
        print("  Password: pass123")
        print("\n" + "="*50)
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("WARNING: This will add test data to your database.")
    response = input("Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        seed_database()
    else:
        print("Operation cancelled.")
