import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "EDU_Track")

def generate_hash(password: str) -> str:
    """Generate a bcrypt hash for a password"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def update_passwords():
    """Update all user passwords to the correct hash for 'password123'"""
    # Generate the correct hash
    correct_hash = generate_hash('password123')
    print(f"Generated hash: {correct_hash}")
    
    # Connect to database
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    
    try:
        cursor = conn.cursor()
        
        # Update Student passwords
        cursor.execute("UPDATE Student SET password = %s", (correct_hash,))
        students_updated = cursor.rowcount
        print(f"Updated {students_updated} student passwords")
        
        # Update Faculty passwords
        cursor.execute("UPDATE Faculty SET password = %s", (correct_hash,))
        faculty_updated = cursor.rowcount
        print(f"Updated {faculty_updated} faculty passwords")
        
        # Update Admin passwords
        cursor.execute("UPDATE Admin SET password = %s", (correct_hash,))
        admin_updated = cursor.rowcount
        print(f"Updated {admin_updated} admin passwords")
        
        # Commit changes
        conn.commit()
        print("\n✓ All passwords updated successfully!")
        print("All users can now login with password: password123")
        
    finally:
        conn.close()

if __name__ == "__main__":
    update_passwords()
