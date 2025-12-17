import sys
sys.path.insert(0, r'c:\Users\user\Desktop\EDU_Track\EDU_Track\backend')

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("ALL TABLES IN DATABASE:")
    print("=" * 80)
    result = conn.execute(text("SHOW TABLES"))
    tables = [row[0] for row in result]
    for table in sorted(tables):
        print(f"  - {table}")
    
    print("\n" + "=" * 80)
    print("KEY FINDINGS:")
    print("-" * 80)
    print(f"Total tables: {len(tables)}")
    print(f"\nFaculty-related tables:")
    faculty_tables = [t for t in tables if 'faculty' in t.lower() or 'notification' in t.lower() or 'announcement' in t.lower()]
    for t in faculty_tables:
        print(f"  - {t}")
