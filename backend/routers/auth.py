from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import Student, Faculty, Admin
from security import verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    identifier = (payload.get('email') or payload.get('username') or '').strip()
    password = (payload.get('password') or '').strip()
    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Email/username and password required")

    user = db.query(Student).filter(
        or_(Student.email == identifier,
            Student.username == identifier,
            Student.contact == identifier,
            Student.full_name == identifier)
    ).first()
    if user:
        if verify_password(password, user.password):
            return {
                "role": user.role,
                "id": user.student_id,
                "name": user.full_name,
                "email": user.email
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    faculty = db.query(Faculty).filter(
        or_(Faculty.email == identifier,
            Faculty.contact == identifier,
            Faculty.name == identifier)
    ).first()
    if faculty:
        if verify_password(password, faculty.password):
            return {
                "role": faculty.role,
                "id": faculty.faculty_id,
                "name": faculty.name,
                "email": faculty.email
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    admin = db.query(Admin).filter(
        or_(Admin.email == identifier,
            Admin.name == identifier)
    ).first()
    if admin:
        if verify_password(password, admin.password):
            return {
                "role": admin.role,
                "id": admin.admin_id,
                "name": admin.name,
                "email": admin.email
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    raise HTTPException(status_code=401, detail="Invalid credentials")
