from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Feedback
from schemas import FeedbackCreate

def create_feedback(db: Session, data: FeedbackCreate):
    obj = Feedback(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_feedbacks(db: Session):
    return db.query(Feedback).all()

def get_feedback(db: Session, feedback_id: int):
    return db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()

def delete_feedback(db: Session, feedback_id: int):
    f = get_feedback(db, feedback_id)
    if not f:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(f)
    db.commit()
    return {"detail": "Feedback deleted"}
