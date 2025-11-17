from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Student
from schemas import StudentCreate, StudentResponse

def create_student(db: Session, student: StudentCreate) -> Student:
    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_students(db: Session):
    return db.query(Student).all()

def get_student(db: Session, student_id: int):
    return db.query(Student).filter(Student.student_id == student_id).first()

def update_student(db: Session, student_id: int, data: StudentCreate):
    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in data.dict().items():
        setattr(student, key, value)
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
