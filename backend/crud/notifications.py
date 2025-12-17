from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Notifications
from schemas import NotificationCreate

def create_notification(db: Session, data: NotificationCreate):
    obj = Notifications(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_notifications(db: Session):
    return db.query(Notifications).all()

def get_student_notifications(db: Session, student_id: int):
    """Get all notifications for a specific student"""
    return db.query(Notifications).filter(
        Notifications.student_id == student_id
    ).order_by(Notifications.created_at.desc()).all()

def mark_student_notifications_read(db: Session, student_id: int):
    """Mark all notifications for a student as read"""
    db.query(Notifications).filter(
        Notifications.student_id == student_id,
        Notifications.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"detail": "Notifications marked as read"}

def get_notification(db: Session, notification_id: int):
    return db.query(Notifications).filter(Notifications.notification_id == notification_id).first()

def update_notification(db: Session, notification_id: int, data: dict):
    n = get_notification(db, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    for key, value in data.items():
        if hasattr(n, key):
            setattr(n, key, value)
    db.commit()
    db.refresh(n)
    return n

def delete_notification(db: Session, notification_id: int):
    n = get_notification(db, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(n)
    db.commit()
    return {"detail": "Notification deleted"}
