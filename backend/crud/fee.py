from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models import Fee
from backend.schemas import FeeCreate

def create_fee(db: Session, data: FeeCreate):
    obj = Fee(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_fees(db: Session):
    return db.query(Fee).all()

def get_student_fees(db: Session, student_id: int):
    """Get all fees for a specific student"""
    return db.query(Fee).filter(Fee.student_id == student_id).all()

def get_fee(db: Session, fee_id: int):
    return db.query(Fee).filter(Fee.fee_id == fee_id).first()

def update_fee(db: Session, fee_id: int, data: FeeCreate):
    f = get_fee(db, fee_id)
    if not f:
        raise HTTPException(status_code=404, detail="Fee record not found")
    for k, v in data.dict().items():
        setattr(f, k, v)
    db.commit()
    db.refresh(f)
    return f

def delete_fee(db: Session, fee_id: int):
    f = get_fee(db, fee_id)
    if not f:
        raise HTTPException(status_code=404, detail="Fee record not found")
    db.delete(f)
    db.commit()
    return {"detail": "Fee deleted"}
