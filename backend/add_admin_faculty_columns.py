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

def add_columns_to_tables():
    connection = None
    try:
        connection = pymysql.connect(**db_config)
        cursor = connection.cursor()
        
        # Check and add columns for Admin table
        print("\nChecking Admin table...")
        cursor.execute("SHOW COLUMNS FROM Admin LIKE 'account_status'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE Admin ADD COLUMN account_status VARCHAR(20) DEFAULT 'active'")
            print("✓ Added account_status to Admin table")
        else:
            print("✓ account_status already exists in Admin table")
            
        cursor.execute("SHOW COLUMNS FROM Admin LIKE 'twofa_enabled'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE Admin ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE")
            print("✓ Added twofa_enabled to Admin table")
        else:
            print("✓ twofa_enabled already exists in Admin table")
        
        # Check and add columns for Faculty table
        print("\nChecking Faculty table...")
        cursor.execute("SHOW COLUMNS FROM Faculty LIKE 'account_status'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE Faculty ADD COLUMN account_status VARCHAR(20) DEFAULT 'active'")
            print("✓ Added account_status to Faculty table")
        else:
            print("✓ account_status already exists in Faculty table")
            
        cursor.execute("SHOW COLUMNS FROM Faculty LIKE 'twofa_enabled'")
        if cursor.fetchone() is None:
            cursor.execute("ALTER TABLE Faculty ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE")
            print("✓ Added twofa_enabled to Faculty table")
        else:
            print("✓ twofa_enabled already exists in Faculty table")
        
        connection.commit()
        print("\n✓ Database schema updated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    add_columns_to_tables()
