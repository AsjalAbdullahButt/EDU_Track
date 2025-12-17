"""Update all user passwords with correct bcrypt hash"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from security import hash_password
from models import Student, Faculty, Admin

def update_passwords():
    db = SessionLocal()
    try:
        # Generate proper bcrypt hash
        correct_hash = hash_password('password123')
        print(f"Generated hash: {correct_hash}")
        
        # Update all students
        students = db.query(Student).all()
        for student in students:
            student.password = correct_hash
        print(f"Updated {len(students)} students")
        
        # Update all faculty
        faculty = db.query(Faculty).all()
        for fac in faculty:
            fac.password = correct_hash
        print(f"Updated {len(faculty)} faculty")
        
        # Update all admins
        admins = db.query(Admin).all()
        for admin in admins:
            admin.password = correct_hash
        print(f"Updated {len(admins)} admins")
        
        # Commit changes
        db.commit()
        print("\n✓ All passwords updated successfully!")
        print("Password for all users: password123")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_passwords()
