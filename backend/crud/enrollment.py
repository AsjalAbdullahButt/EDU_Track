from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models import Enrollment
from backend.schemas import EnrollmentCreate

def create_enrollment(db: Session, data: EnrollmentCreate):
    obj = Enrollment(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_enrollments(db: Session):
    return db.query(Enrollment).all()

def get_enrollment(db: Session, enrollment_id: int):
    return db.query(Enrollment).filter(Enrollment.enrollment_id == enrollment_id).first()

def update_enrollment(db: Session, enrollment_id: int, data: EnrollmentCreate):
    e = get_enrollment(db, enrollment_id)
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    for k, v in data.dict().items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return e

def delete_enrollment(db: Session, enrollment_id: int):
    e = get_enrollment(db, enrollment_id)
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(e)
    db.commit()
    return {"detail": "Enrollment deleted"}
