from sqlalchemy.orm import Session
from models import Salary, Faculty
from schemas import NotificationResponse
from datetime import datetime
from fastapi import HTTPException

def create_salary(db: Session, faculty_id: int, amount: float, payment_date: datetime | None = None, status: str = "pending"):
    # Validate faculty exists
    faculty = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail=f"Faculty with ID {faculty_id} not found")
    
    # Validate amount
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    
    # Validate status
    valid_statuses = ["pending", "paid", "completed", "overdue"]
    if status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    obj = Salary(
        faculty_id=faculty_id,
        amount=amount,
        payment_date=payment_date or datetime.utcnow() if status in ["paid", "completed"] else None,
        status=status.lower()
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_salaries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Salary).order_by(Salary.payment_date.desc()).offset(skip).limit(limit).all()

def get_faculty_salaries(db: Session, faculty_id: int):
    """Get all salary records for a specific faculty member"""
    # Validate faculty exists
    faculty = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail=f"Faculty with ID {faculty_id} not found")
    
    return db.query(Salary).filter(Salary.faculty_id == faculty_id).order_by(Salary.payment_date.desc()).all()

def get_salary(db: Session, salary_id: int):
    return db.query(Salary).filter(Salary.salary_id == salary_id).first()

def delete_salary(db: Session, salary_id: int):
    s = get_salary(db, salary_id)
    if not s:
        raise HTTPException(status_code=404, detail="Salary record not found")
    db.delete(s)
    db.commit()
    return {"detail": "Salary deleted"}

