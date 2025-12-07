from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Attendance, Enrollment
from schemas import AttendanceCreate

def create_attendance(db: Session, data: AttendanceCreate):
    obj = Attendance(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_attendances(db: Session):
    return db.query(Attendance).all()

def get_student_attendance(db: Session, student_id: int):
    """Get attendance records for a student's enrolled courses only"""
    return db.query(Attendance).select_from(Attendance).join(
        Enrollment,
        (Attendance.student_id == Enrollment.student_id) & 
        (Attendance.course_id == Enrollment.course_id)
    ).filter(
        Attendance.student_id == student_id,
        Enrollment.status == "Active"
    ).all()

def get_attendance(db: Session, attendance_id: int):
    return db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()

def update_attendance(db: Session, attendance_id: int, data: AttendanceCreate):
    a = get_attendance(db, attendance_id)
    if not a:
        raise HTTPException(status_code=404, detail="Attendance not found")
    for k, v in data.dict().items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a

def delete_attendance(db: Session, attendance_id: int):
    a = get_attendance(db, attendance_id)
    if not a:
        raise HTTPException(status_code=404, detail="Attendance not found")
    db.delete(a)
    db.commit()
    return {"detail": "Attendance deleted"}
