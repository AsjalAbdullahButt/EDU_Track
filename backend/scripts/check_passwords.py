"""
Check and fix password hashes in the database
"""

import sys
sys.path.append('..')

from sqlalchemy.orm import Session
from database import SessionLocal
from models import Student, Faculty, Admin
from security import hash_password

def check_and_fix_passwords():
    db = SessionLocal()
    
    try:
        print("Checking password hashes in database...\n")
        
        # Check admin passwords
        admins = db.query(Admin).all()
        for admin in admins:
            print(f"Admin: {admin.name} ({admin.email})")
            print(f"  Password hash: {admin.password[:50]}...")
            
            # Check if it's a valid bcrypt hash (should start with $2b$ or $2a$ or $2y$)
            if not admin.password.startswith('$2'):
                print(f"  ⚠️  Invalid hash detected! Fixing...")
                # Assuming the stored value is the plain password
                admin.password = hash_password(admin.password)
                print(f"  ✓ Fixed password hash")
            else:
                print(f"  ✓ Valid bcrypt hash")
            print()
        
        # Check faculty passwords
        faculties = db.query(Faculty).all()
        for faculty in faculties:
            print(f"Faculty: {faculty.name} ({faculty.email})")
            print(f"  Password hash: {faculty.password[:50]}...")
            
            if not faculty.password.startswith('$2'):
                print(f"  ⚠️  Invalid hash detected! Fixing...")
                faculty.password = hash_password(faculty.password)
                print(f"  ✓ Fixed password hash")
            else:
                print(f"  ✓ Valid bcrypt hash")
            print()
        
        # Check student passwords
        students = db.query(Student).all()
        for student in students:
            print(f"Student: {student.full_name} ({student.email})")
            print(f"  Password hash: {student.password[:50]}...")
            
            if not student.password.startswith('$2'):
                print(f"  ⚠️  Invalid hash detected! Fixing...")
                # Assuming the stored value is the plain password
                faculty.password = hash_password(student.password)
                print(f"  ✓ Fixed password hash")
            else:
                print(f"  ✓ Valid bcrypt hash")
            print()
        
        # Commit changes
        db.commit()
        print("\n" + "="*50)
        print("Password hash check and fix completed!")
        print("="*50)
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    check_and_fix_passwords()
