import pymysql

# Common MySQL passwords to try
passwords = [
    "",  # Empty password
    "root",
    "password",
    "admin",
    "mysql",
    "123456",
    "HelloMySQL123",
    "MySQL123",
    "Root123",
    "Password123"
]

print("Testing MySQL passwords...")
for pwd in passwords:
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password=pwd,
            database='mysql'  # Connect to default mysql db first
        )
        print(f"\n✓ SUCCESS! Password found: '{pwd}'")
        
        # Update .env file
        env_content = f"""DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD={pwd}
DB_NAME=EDU_Track

INIT_DB=true
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print("✓ .env file updated!")
        connection.close()
        break
        
    except Exception as e:
        if "Access denied" in str(e):
            print(f"✗ Failed with password: '{pwd}'")
        else:
            print(f"✗ Error: {e}")
