from database import SessionLocal
from models import Faculty
from security import verify_password

db = SessionLocal()
print('All faculty members:')
faculties = db.query(Faculty).all()
for f in faculties:
    print(f'{f.faculty_id}: {f.name} - {f.email}')
    result = verify_password('password123', f.password)
    print(f'  Password verification: {result}')
    print(f'  Password hash: {f.password[:60]}...')
db.close()
