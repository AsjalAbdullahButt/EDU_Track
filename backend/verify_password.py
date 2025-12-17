import bcrypt
import pymysql
import os
from dotenv import load_dotenv

load_dotenv('.env')

# Get user from database
conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "edu_track")
)

cursor = conn.cursor()
cursor.execute("SELECT password FROM Student WHERE username = 'asjal'")
db_hash = cursor.fetchone()[0]
conn.close()

print("Testing password verification...")
print(f"Database hash: {db_hash}")
print(f"Hash length: {len(db_hash)}")
print()

# Test password
test_password = "password123"
print(f"Testing password: '{test_password}'")

try:
    password_bytes = test_password.encode('utf-8')[:72]
    hashed_bytes = db_hash.encode('utf-8')
    result = bcrypt.checkpw(password_bytes, hashed_bytes)
    print(f"✓ Verification result: {result}")
    
    if result:
        print("✓ Password matches!")
    else:
        print("✗ Password does NOT match!")
        
        # Try to hash the password and see what we get
        print("\nGenerating new hash for 'password123':")
        new_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        print(f"New hash: {new_hash.decode('utf-8')}")
        
except Exception as e:
    print(f"✗ Error: {e}")
