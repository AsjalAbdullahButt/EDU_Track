import os
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv('.env')

# Database connection
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def add_course_columns():
    connection = None
    try:
        connection = pymysql.connect(**db_config)
        cursor = connection.cursor()
        
        print("Checking Course table...")
        
        # Check for course_status column
        cursor.execute("SHOW COLUMNS FROM Course LIKE 'course_status'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE Course ADD COLUMN course_status VARCHAR(20) DEFAULT 'Pending'")
            print("✓ Added course_status to Course table")
        else:
            print("✓ course_status already exists in Course table")
        
        # Check for description column
        cursor.execute("SHOW COLUMNS FROM Course LIKE 'description'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE Course ADD COLUMN description VARCHAR(500)")
            print("✓ Added description to Course table")
        else:
            print("✓ description already exists in Course table")
        
        connection.commit()
        print("\n✓ Course table schema updated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    add_course_columns()
