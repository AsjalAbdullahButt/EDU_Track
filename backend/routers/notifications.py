from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import notifications as notifications_crud
from backend.schemas import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=NotificationResponse)
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    return notifications_crud.create_notification(db, data)

@router.get("/", response_model=list[NotificationResponse])
def list_notifications(db: Session = Depends(get_db)):
    return notifications_crud.get_notifications(db)

@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    n = notifications_crud.get_notification(db, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    return notifications_crud.delete_notification(db, notification_id)
