"""
Migration script to add username column to Student table
"""

from sqlalchemy import text
from database import engine, SessionLocal
from models import Student
from security import hash_password

def add_username_column():
    """Add username column to Student table and generate usernames for existing students"""
    
    db = SessionLocal()
    
    try:
        print("Adding username column to Student table...")
        
        # Add the column if it doesn't exist
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Student' 
                AND COLUMN_NAME = 'username'
            """))
            
            exists = result.fetchone()[0] > 0
            
            if not exists:
                # Add the username column
                conn.execute(text("""
                    ALTER TABLE Student 
                    ADD username VARCHAR(50) NULL
                """))
                conn.commit()
                print("✓ Username column added successfully")
                
                # Generate usernames for existing students
                students = db.query(Student).all()
                
                for student in students:
                    if not student.username:
                        # Use full name as username
                        username = student.full_name
                        
                        student.username = username
                        print(f"  Set username '{username}' for {student.full_name}")
                
                db.commit()
                print("✓ Generated usernames for all existing students")
                
                # Now make the column unique
                with engine.connect() as conn2:
                    conn2.execute(text("""
                        CREATE UNIQUE INDEX idx_student_username 
                        ON Student(username)
                    """))
                    conn2.commit()
                    print("✓ Added unique constraint to username column")
            else:
                print("✓ Username column already exists")
        
        print("\nMigration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_username_column()
