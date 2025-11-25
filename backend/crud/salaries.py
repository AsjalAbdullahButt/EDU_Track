from sqlalchemy.orm import Session
from models import Salary
from schemas import NotificationResponse
from datetime import datetime
from fastapi import HTTPException

def create_salary(db: Session, faculty_id: int, amount: float, payment_date: datetime | None = None, status: str = "pending"):
    obj = Salary(
        faculty_id=faculty_id,
        amount=amount,
        payment_date=payment_date or datetime.utcnow(),
        status=status
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_salaries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Salary).order_by(Salary.payment_date.desc()).offset(skip).limit(limit).all()

def get_salary(db: Session, salary_id: int):
    return db.query(Salary).filter(Salary.salary_id == salary_id).first()

def delete_salary(db: Session, salary_id: int):
    s = get_salary(db, salary_id)
    if not s:
        raise HTTPException(status_code=404, detail="Salary record not found")
    db.delete(s)
    db.commit()
    return {"detail": "Salary deleted"}
