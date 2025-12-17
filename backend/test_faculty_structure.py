from database import engine
from sqlalchemy import text

print("FACULTY DATABASE TABLES STRUCTURE:")
print("=" * 80)

with engine.connect() as conn:
    # Show all tables
    result = conn.execute(text("SHOW TABLES"))
    tables = [row[0] for row in result]
    print(f"\nAll tables: {', '.join(tables)}\n")
    
    # Faculty table structure
    print("FACULTY TABLE:")
    print("-" * 80)
    result = conn.execute(text("DESCRIBE faculty"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    # Sample faculty data
    print("\n" + "=" * 80)
    print("FACULTY RECORDS:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT faculty_id, faculty_name, email, department, contact
        FROM faculty
        LIMIT 5
    """))
    for row in result:
        print(f"  ID {row[0]}: {row[1]} - {row[2]} - Dept: {row[3]}")
    
    # Course table structure
    print("\n" + "=" * 80)
    print("COURSE TABLE:")
    print("-" * 80)
    result = conn.execute(text("DESCRIBE course"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    # Courses with faculty
    print("\n" + "=" * 80)
    print("COURSES WITH FACULTY:")
    print("-" * 80)
    result = conn.execute(text("""
        SELECT c.course_id, c.course_name, c.course_code, c.faculty_id, f.faculty_name
        FROM course c
        LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
        ORDER BY c.course_id
        LIMIT 10
    """))
    for cid, cname, ccode, fid, fname in result:
        print(f"  Course {cid} ({ccode}): {cname} - Faculty: {fname or 'Not Assigned'}")
    
    # Check attendance table
    print("\n" + "=" * 80)
    print("ATTENDANCE TABLE:")
    print("-" * 80)
    result = conn.execute(text("DESCRIBE attendance"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    # Check notifications table
    print("\n" + "=" * 80)
    print("NOTIFICATION TABLE:")
    print("-" * 80)
    result = conn.execute(text("DESCRIBE notification"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
