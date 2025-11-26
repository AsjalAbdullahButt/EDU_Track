from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models import Student, Faculty, Admin

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    # Accept an identifier that can be an email, contact (roll) or full name
    identifier = (payload.get('email') or payload.get('username') or '').strip()
    password = (payload.get('password') or '').strip()
    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Email/username and password required")

    # Try student (match email OR contact OR full_name)
    user = db.query(Student).filter(
        or_(Student.email == identifier,
            Student.contact == identifier,
            Student.full_name == identifier),
        Student.password == password
    ).first()
    if user:
        return {"role": "student", "id": user.student_id, "name": user.full_name}

    # Try faculty (match email OR contact OR name)
    faculty = db.query(Faculty).filter(
        or_(Faculty.email == identifier,
            Faculty.contact == identifier,
            Faculty.name == identifier),
        Faculty.password == password
    ).first()
    if faculty:
        return {"role": "faculty", "id": faculty.faculty_id, "name": faculty.name}

    # Try admin (match email OR name)
    admin = db.query(Admin).filter(
        or_(Admin.email == identifier,
            Admin.name == identifier),
        Admin.password == password
    ).first()
    if admin:
        return {"role": "admin", "id": admin.admin_id, "name": admin.name}

    raise HTTPException(status_code=401, detail="Invalid credentials")
