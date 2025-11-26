from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models import Notifications
from backend.schemas import NotificationCreate

def create_notification(db: Session, data: NotificationCreate):
    obj = Notifications(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_notifications(db: Session):
    return db.query(Notifications).all()

def get_notification(db: Session, notification_id: int):
    return db.query(Notifications).filter(Notifications.notification_id == notification_id).first()

def delete_notification(db: Session, notification_id: int):
    n = get_notification(db, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(n)
    db.commit()
    return {"detail": "Notification deleted"}
