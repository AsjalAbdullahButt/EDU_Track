import pymysql
import getpass

print("Testing MySQL Connection...")
password = getpass.getpass("Enter MySQL root password: ")

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password=password,
        database='EDU_Track'
    )
    print("✓ Connection successful!")
    
    # Update .env file
    env_content = f"""DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD={password}
DB_NAME=EDU_Track

INIT_DB=true
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✓ .env file updated successfully!")
    connection.close()
    
except Exception as e:
    print(f"✗ Connection failed: {e}")
