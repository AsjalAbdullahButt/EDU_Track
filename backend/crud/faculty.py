from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Faculty
from schemas import FacultyCreate
from security import hash_password

def create_faculty(db: Session, data: FacultyCreate):
    faculty_data = data.dict()
    faculty_data['password'] = hash_password(faculty_data['password'])
    obj = Faculty(**faculty_data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_faculties(db: Session):
    return db.query(Faculty).all()

def get_faculty(db: Session, faculty_id: int):
    return db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()

def update_faculty(db: Session, faculty_id: int, data: FacultyCreate):
    faculty = get_faculty(db, faculty_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    update_data = data.dict()
    if 'password' in update_data and update_data['password']:
        update_data['password'] = hash_password(update_data['password'])
    
    for k, v in update_data.items():
        setattr(faculty, k, v)
    db.commit()
    db.refresh(faculty)
    return faculty

def delete_faculty(db: Session, faculty_id: int):
    faculty = get_faculty(db, faculty_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    db.delete(faculty)
    db.commit()
    return {"detail": "Faculty deleted"}
