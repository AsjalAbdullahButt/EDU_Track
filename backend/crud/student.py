from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Student
from schemas import StudentCreate, StudentResponse
from security import hash_password
from sqlalchemy.exc import IntegrityError

def create_student(db: Session, student: StudentCreate) -> Student:
    existing = db.query(Student).filter(Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    student_data = student.dict()
    student_data['password'] = hash_password(student_data['password'])
    db_student = Student(**student_data)
    db.add(db_student)
    try:
        db.commit()
        db.refresh(db_student)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e.orig))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return db_student

def get_students(db: Session):
    return db.query(Student).all()

def get_student(db: Session, student_id: int):
    return db.query(Student).filter(Student.student_id == student_id).first()

def update_student(db: Session, student_id: int, data: StudentCreate):
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = data.dict()
    if 'password' in update_data and update_data['password']:
        update_data['password'] = hash_password(update_data['password'])
    
    for key, value in update_data.items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


def submit_profile_update(db: Session, student_id: int, updates: dict):
    """Apply profile updates and mark verification pending."""
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    # Only update allowed profile fields
    allowed = {"gender", "dob", "department", "contact", "address"}
    for k, v in updates.items():
        if k in allowed:
            setattr(student, k, v)
    student.verification_status = 'pending'
    student.profile_verified = False
    db.commit()
    db.refresh(student)
    return student


def list_pending_profiles(db: Session):
    return db.query(Student).filter(Student.verification_status == 'pending').all()


def verify_profile(db: Session, student_id: int, approve: bool = True):
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.profile_verified = bool(approve)
    student.verification_status = 'verified' if approve else 'rejected'
    db.commit()
    db.refresh(student)
    return student

def delete_student(db: Session, student_id: int):
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"detail": "Student deleted"}
