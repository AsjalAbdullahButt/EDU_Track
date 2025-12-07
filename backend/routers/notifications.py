from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import notifications as notifications_crud
from schemas import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationResponse)
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    return notifications_crud.create_notification(db, data)

@router.get("/", response_model=list[NotificationResponse])
def list_notifications(db: Session = Depends(get_db)):
    return notifications_crud.get_notifications(db)

@router.get("/student/{student_id}", response_model=list[NotificationResponse])
def get_student_notifications(student_id: int, db: Session = Depends(get_db)):
    """Get all notifications for a specific student"""
    return notifications_crud.get_student_notifications(db, student_id)

@router.post("/student/{student_id}/mark-read")
def mark_notifications_read(student_id: int, db: Session = Depends(get_db)):
    """Mark all notifications for a student as read"""
    return notifications_crud.mark_student_notifications_read(db, student_id)

@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    n = notifications_crud.get_notification(db, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n

@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(notification_id: int, data: dict, db: Session = Depends(get_db)):
    return notifications_crud.update_notification(db, notification_id, data)

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    return notifications_crud.delete_notification(db, notification_id)
