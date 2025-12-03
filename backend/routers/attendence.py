from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import attendence as attendance_crud
from backend.schemas import AttendanceCreate, AttendanceResponse
router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse)
def create_attendance(data: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_crud.create_attendance(db, data)

@router.get("/", response_model=list[AttendanceResponse])
def list_attendance(db: Session = Depends(get_db)):
    return attendance_crud.get_attendances(db)

@router.get("/student/{student_id}", response_model=list[AttendanceResponse])
def get_student_attendance(student_id: int, db: Session = Depends(get_db)):
    """Get attendance records for a student's enrolled courses only"""
    return attendance_crud.get_student_attendance(db, student_id)

@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance(attendance_id: int, db: Session = Depends(get_db)):
    a = attendance_crud.get_attendance(db, attendance_id)
    if not a:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return a

@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(attendance_id: int, data: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_crud.update_attendance(db, attendance_id, data)

@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    return attendance_crud.delete_attendance(db, attendance_id)
