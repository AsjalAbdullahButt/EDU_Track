import os
from dotenv import load_dotenv
import pymysql

# Load .env file
env_path = os.path.join(os.path.dirname(__file__), '.env')
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

# Get credentials
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "")
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "3306")
db_name = os.getenv("DB_NAME", "EDU_Track")

print(f"\nCredentials loaded:")
print(f"  Host: {db_host}")
print(f"  Port: {db_port}")
print(f"  User: {db_user}")
print(f"  Password: {'*' * len(db_password)}")
print(f"  Database: {db_name}")

# Test connection
try:
    print(f"\nAttempting connection to MySQL...")
    connection = pymysql.connect(
        host=db_host,
        port=int(db_port),
        user=db_user,
        password=db_password,
        database=db_name
    )
    print("✓ Connection successful!")
    
    # Test query
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM Student")
    count = cursor.fetchone()[0]
    print(f"✓ Found {count} students in database")
    
    connection.close()
    print("\nDatabase is ready! Server should start successfully.")
    
except Exception as e:
    print(f"\n✗ Connection failed!")
    print(f"Error: {e}")
    print(f"\nTrying direct password from .env file...")
    
    # Read .env directly
    with open('.env', 'r') as f:
        lines = f.readlines()
        for line in lines:
            if line.startswith('DB_PASSWORD='):
                direct_password = line.strip().split('=', 1)[1]
                print(f"Direct password length: {len(direct_password)}")
                print(f"Loaded password length: {len(db_password)}")
                
                # Try with direct password
                try:
                    connection = pymysql.connect(
                        host=db_host,
                        port=int(db_port),
                        user=db_user,
                        password=direct_password,
                        database=db_name
                    )
                    print(f"✓ Connection successful with direct password!")
                    connection.close()
                except Exception as e2:
                    print(f"✗ Direct password also failed: {e2}")
