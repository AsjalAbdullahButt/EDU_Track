from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Grades
from schemas import GradesCreate

def create_grade(db: Session, data: GradesCreate):
    obj = Grades(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_grades(db: Session):
    return db.query(Grades).all()

def get_grade(db: Session, grade_id: int):
    return db.query(Grades).filter(Grades.grade_id == grade_id).first()

def update_grade(db: Session, grade_id: int, data: GradesCreate):
    g = get_grade(db, grade_id)
    if not g:
        raise HTTPException(status_code=404, detail="Grade record not found")
    for k, v in data.dict().items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return g

def delete_grade(db: Session, grade_id: int):
    g = get_grade(db, grade_id)
    if not g:
        raise HTTPException(status_code=404, detail="Grade record not found")
    db.delete(g)
    db.commit()
    return {"detail": "Grade deleted"}
