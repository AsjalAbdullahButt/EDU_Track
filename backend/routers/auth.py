from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Student, Faculty, Admin

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    # Try student
    user = db.query(Student).filter(Student.email == email, Student.password == password).first()
    if user:
        return {"role": "student", "id": user.student_id, "name": user.full_name}

    # Try faculty
    faculty = db.query(Faculty).filter(Faculty.email == email, Faculty.password == password).first()
    if faculty:
        return {"role": "faculty", "id": faculty.faculty_id, "name": faculty.name}

    # Try admin
    admin = db.query(Admin).filter(Admin.email == email, Admin.password == password).first()
    if admin:
        return {"role": "admin", "id": admin.admin_id, "name": admin.name}

    raise HTTPException(status_code=401, detail="Invalid credentials")
