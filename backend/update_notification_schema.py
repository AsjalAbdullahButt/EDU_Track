import pymysql
import os
from dotenv import load_dotenv

# Load .env from backend folder
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'EDU_Track')
DB_PORT = int(os.getenv('DB_PORT', 3306))

conn = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT)
cur = conn.cursor()

# Add missing columns if they don't exist
try:
    cur.execute('ALTER TABLE Notifications ADD COLUMN student_id INT')
    print('Added student_id column')
except Exception as e:
    print(f'student_id column: {str(e)[:80]}')

try:
    cur.execute('ALTER TABLE Notifications ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT "Notification"')
    print('Added title column')
except Exception as e:
    print(f'title column: {str(e)[:80]}')

try:
    cur.execute('ALTER TABLE Notifications ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP')
    print('Added created_at column')
except Exception as e:
    print(f'created_at column: {str(e)[:80]}')

try:
    cur.execute('ALTER TABLE Notifications MODIFY message VARCHAR(500)')
    print('Modified message column to VARCHAR(500)')
except Exception as e:
    print(f'Failed to modify message column: {str(e)[:80]}')

conn.commit()
cur.close()
conn.close()
print('Database schema update completed!')
