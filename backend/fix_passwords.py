import bcrypt
import pymysql
import os
from dotenv import load_dotenv

load_dotenv('.env')

# Generate correct hash for password123
password = "password123"
password_bytes = password.encode('utf-8')[:72]
correct_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

print(f"Generated hash for 'password123': {correct_hash}")
print()

# Update database
conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "edu_track")
)

cursor = conn.cursor()

# Update all Student passwords
cursor.execute(f"UPDATE Student SET password = '{correct_hash}'")
student_count = cursor.rowcount

# Update all Faculty passwords
cursor.execute(f"UPDATE Faculty SET password = '{correct_hash}'")
faculty_count = cursor.rowcount

# Update all Admin passwords
cursor.execute(f"UPDATE Admin SET password = '{correct_hash}'")
admin_count = cursor.rowcount

conn.commit()
conn.close()

print(f"✓ Updated {student_count} student passwords")
print(f"✓ Updated {faculty_count} faculty passwords")
print(f"✓ Updated {admin_count} admin passwords")
print()
print("All accounts now use password: 'password123'")
