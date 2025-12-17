import pymysql
import os
from dotenv import load_dotenv

load_dotenv('.env')

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "edu_track")
)

cursor = conn.cursor()

# Check if columns exist
cursor.execute("SHOW COLUMNS FROM Student LIKE 'account_status'")
has_account_status = cursor.fetchone() is not None

cursor.execute("SHOW COLUMNS FROM Student LIKE 'twofa_enabled'")
has_twofa = cursor.fetchone() is not None

print(f"account_status exists: {has_account_status}")
print(f"twofa_enabled exists: {has_twofa}")

# Add columns if they don't exist
if not has_account_status:
    print("Adding account_status column...")
    cursor.execute("ALTER TABLE Student ADD COLUMN account_status VARCHAR(20) DEFAULT 'active' AFTER verification_status")
    print("✓ account_status column added")
else:
    print("✓ account_status column already exists")

if not has_twofa:
    print("Adding twofa_enabled column...")
    cursor.execute("ALTER TABLE Student ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE AFTER account_status")
    print("✓ twofa_enabled column added")
else:
    print("✓ twofa_enabled column already exists")

conn.commit()
conn.close()

print("\n✓ Database schema updated successfully!")
