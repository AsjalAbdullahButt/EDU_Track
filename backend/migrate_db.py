"""
Database Migration Script for EDU Track
Updates existing database schema to support new features
"""

from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "EDU_Track")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def run_migration():
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        print("Starting database migration...")
        
        # Check if Grades table needs updating
        if 'Grades' in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns('Grades')]
            
            # Add new columns for detailed marks if they don't exist
            if 'quiz_marks' not in columns:
                print("Adding quiz_marks column to Grades table...")
                conn.execute(text("ALTER TABLE Grades ADD COLUMN quiz_marks DECIMAL(5,2) DEFAULT 0"))
                conn.commit()
            
            if 'mid_marks' not in columns:
                print("Adding mid_marks column to Grades table...")
                conn.execute(text("ALTER TABLE Grades ADD COLUMN mid_marks DECIMAL(5,2) DEFAULT 0"))
                conn.commit()
            
            if 'assignment_marks' not in columns:
                print("Adding assignment_marks column to Grades table...")
                conn.execute(text("ALTER TABLE Grades ADD COLUMN assignment_marks DECIMAL(5,2) DEFAULT 0"))
                conn.commit()
            
            if 'final_marks' not in columns:
                print("Adding final_marks column to Grades table...")
                conn.execute(text("ALTER TABLE Grades ADD COLUMN final_marks DECIMAL(5,2) DEFAULT 0"))
                conn.commit()
        
        # Ensure Student table has verification fields
        if 'Student' in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns('Student')]
            
            if 'profile_verified' not in columns:
                print("Adding profile_verified column to Student table...")
                conn.execute(text("ALTER TABLE Student ADD COLUMN profile_verified BOOLEAN DEFAULT FALSE"))
                conn.commit()
            
            if 'verification_status' not in columns:
                print("Adding verification_status column to Student table...")
                conn.execute(text("ALTER TABLE Student ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified'"))
                conn.commit()
        
        # Ensure Notifications table has required fields
        if 'Notifications' in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns('Notifications')]
            
            if 'title' not in columns:
                print("Adding title column to Notifications table...")
                conn.execute(text("ALTER TABLE Notifications ADD COLUMN title VARCHAR(255) DEFAULT 'Notification'"))
                conn.commit()
            
            if 'is_read' not in columns:
                print("Adding is_read column to Notifications table...")
                conn.execute(text("ALTER TABLE Notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE"))
                conn.commit()
            
            if 'created_at' not in columns:
                print("Adding created_at column to Notifications table...")
                conn.execute(text("ALTER TABLE Notifications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
                conn.commit()
        
        print("\nMigration completed successfully!")
        print("\nIMPORTANT: Please update all user passwords!")
        print("Existing passwords need to be re-hashed for security.")
        print("Users should use the 'Forgot Password' feature or contact admin.")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"\nERROR during migration: {e}")
        print("Please check your database connection and try again.")
