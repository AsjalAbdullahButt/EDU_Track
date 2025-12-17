from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Show student table columns
    result = conn.execute(text("DESCRIBE student"))
    print("STUDENT table columns:")
    print("=" * 60)
    for row in result:
        print(f"  {row[0]}: {row[1]}")
