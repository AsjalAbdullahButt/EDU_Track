from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from crud import student as student_crud
from schemas import StudentCreate, StudentResponse, SecurityUpdate, PasswordReset
from models import Enrollment, Attendance, Fee, Notifications, Grades
from security import hash_password

router = APIRouter(prefix="/students", tags=["Students"])

@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    return student_crud.create_student(db, student)

@router.get("/", response_model=list[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    return student_crud.get_students(db)

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = student_crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, data: StudentCreate, db: Session = Depends(get_db)):
    return student_crud.update_student(db, student_id, data)

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    return student_crud.delete_student(db, student_id)


@router.post("/{student_id}/profile", response_model=StudentResponse)
def submit_profile(student_id: int, payload: dict, db: Session = Depends(get_db)):
    """Student submits profile updates (gender, dob, department, contact, address).
    Profile will be marked pending and require admin verification."""
    updates = {k: payload.get(k) for k in ("gender", "dob", "department", "contact", "address") if payload.get(k) is not None}
    return student_crud.submit_profile_update(db, student_id, updates)


@router.get("/{student_id}/dashboard/stats")
def get_student_dashboard_stats(student_id: int, db: Session = Depends(get_db)):
    """Return student dashboard statistics"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Fetching dashboard stats for student_id: {student_id}")
    
    # Count active enrolled courses
    enrolled_courses = db.query(func.count(Enrollment.enrollment_id)).filter(
        Enrollment.student_id == student_id,
        Enrollment.status == "Active"
    ).scalar() or 0
    
    logger.info(f"Enrolled courses count: {enrolled_courses}")
    
    # Calculate attendance percentage
    attendance_records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total_attendance = len(attendance_records)
    present_count = sum(1 for a in attendance_records if a.status.lower() == 'present')
    attendance_percentage = round((present_count / total_attendance * 100), 2) if total_attendance > 0 else 0
    
    logger.info(f"Attendance: {present_count}/{total_attendance} = {attendance_percentage}%")
    
    # Calculate CGPA from grades
    grades = db.query(Grades).filter(Grades.student_id == student_id).all()
    grade_points = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0
    }
    
    total_points = 0
    grade_count = 0
    for g in grades:
        if g.grade and g.grade in grade_points:
            total_points += grade_points[g.grade]
            grade_count += 1
    
    cgpa = round(total_points / grade_count, 2) if grade_count > 0 else 0
    
    logger.info(f"CGPA: {cgpa} (from {grade_count} grades)")
    
    # Calculate fee status
    fees = db.query(Fee).filter(Fee.student_id == student_id).all()
    total_fee_amount = sum(float(f.total_amount or 0) for f in fees)
    amount_paid = sum(float(f.amount_paid or 0) for f in fees)
    fee_balance = total_fee_amount - amount_paid
    
    # Determine fee status: Paid if balance is 0 or negative, otherwise Unpaid
    fee_status = "Paid" if fee_balance <= 0 and total_fee_amount > 0 else ("Unpaid" if total_fee_amount > 0 else "N/A")
    
    logger.info(f"Fee status: {fee_status} (Balance: {fee_balance}, Total: {total_fee_amount}, Paid: {amount_paid})")
    
    # Count unread notifications
    unread_notifications = db.query(func.count(Notifications.notification_id)).filter(
        Notifications.student_id == student_id,
        Notifications.is_read == False
    ).scalar() or 0
    
    result = {
        "enrolled_courses": int(enrolled_courses),
        "attendance_percentage": float(attendance_percentage),
        "total_attendance_records": int(total_attendance),
        "present_count": int(present_count),
        "cgpa": float(cgpa),
        "fee_status": fee_status,
        "fee_balance": float(fee_balance),
        "total_fee_amount": float(total_fee_amount),
        "amount_paid": float(amount_paid),
        "unread_notifications": int(unread_notifications)
    }
    
    logger.info(f"Returning dashboard stats: {result}")
    
    return result


# -----------------------------------------------------------
# SECURITY ENDPOINTS
# -----------------------------------------------------------
@router.patch("/{student_id}")
def patch_student_security(student_id: int, update: SecurityUpdate, db: Session = Depends(get_db)):
    """Update student security settings (account_status, twofa_enabled)"""
    student = student_crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if update.account_status is not None:
        student.account_status = update.account_status
    if update.twofa_enabled is not None:
        student.twofa_enabled = update.twofa_enabled
    
    db.commit()
    db.refresh(student)
    return {"detail": "Security settings updated successfully", "student_id": student_id}


@router.post("/{student_id}/reset-password")
def reset_student_password(student_id: int, reset: PasswordReset, db: Session = Depends(get_db)):
    """Reset student password (admin only)"""
    student = student_crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student.password = hash_password(reset.new_password)
    db.commit()
    return {"detail": "Password reset successfully", "student_id": student_id}

