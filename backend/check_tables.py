import sys
sys.path.insert(0, r'c:\Users\user\Desktop\EDU_Track\EDU_Track\backend')

from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("TABLE STRUCTURES:")
    print("=" * 80)
    
    print("\nATTENDANCE TABLE:")
    result = conn.execute(text("DESCRIBE attendance"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    print("\nNOTIFICATION TABLE:")
    result = conn.execute(text("DESCRIBE notification"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    print("\nMARKS TABLE:")
    result = conn.execute(text("DESCRIBE marks"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    print("\nENROLLMENT TABLE:")
    result = conn.execute(text("DESCRIBE enrollment"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")

print("\nDone!")
