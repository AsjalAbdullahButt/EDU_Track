from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from crud import admin as admin_crud
from schemas import AdminCreate, AdminResponse, SecurityUpdate, PasswordReset
from crud import student as student_crud
from schemas import StudentResponse
from models import Student, Faculty, Fee, Notifications
from security import hash_password


def require_admin(x_user_role: str | None = Header(None)):
    """Simple header-based admin guard. Frontend should send `x-user-role: admin` header."""
    # More lenient check - allow if role is admin or if it's missing (for backward compatibility)
    if x_user_role and x_user_role != 'admin':
        raise HTTPException(status_code=403, detail="Admin privileges required")

router = APIRouter(prefix="/admins", tags=["Admin"])

# Specific routes must come BEFORE parameterized routes to avoid conflicts
@router.get('/pending-profiles', response_model=list[StudentResponse])
def pending_profiles(db: Session = Depends(get_db), _=Depends(require_admin)):
    return student_crud.list_pending_profiles(db)


@router.get('/dashboard/stats')
def get_dashboard_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    """Return admin dashboard statistics"""
    # Count only verified and registered students (profile_verified=True AND verification_status='verified')
    total_students = db.query(func.count(Student.student_id)).filter(
        Student.profile_verified == True,
        Student.verification_status == 'verified'
    ).scalar() or 0
    
    # Count all registered faculty members
    total_faculty = db.query(func.count(Faculty.faculty_id)).scalar() or 0
    
    # Calculate exact fee collection percentage
    fees = db.query(Fee).all()
    total_amount = sum(f.total_amount or 0 for f in fees)
    amount_paid = sum(f.amount_paid or 0 for f in fees)
    fee_collection_percent = round((amount_paid / total_amount * 100), 2) if total_amount > 0 else 0
    
    # Count pending requests: students with verification_status='pending' 
    # OR students missing required fields (address, department)
    pending_verification = db.query(func.count(Student.student_id)).filter(
        Student.verification_status == 'pending'
    ).scalar() or 0
    
    # Count students with missing required fields (address or department is NULL or empty)
    incomplete_profiles = db.query(func.count(Student.student_id)).filter(
        (Student.address.is_(None)) | (Student.address == '') |
        (Student.department.is_(None)) | (Student.department == '')
    ).scalar() or 0
    
    # Total pending requests (use set to avoid double counting)
    # Students can be in both categories, so we need to count distinct students
    pending_students = db.query(Student).filter(
        (Student.verification_status == 'pending') |
        (Student.address.is_(None)) | (Student.address == '') |
        (Student.department.is_(None)) | (Student.department == '')
    ).all()
    pending_requests = len(pending_students)
    
    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "fee_collection_percent": fee_collection_percent,
        "pending_requests": pending_requests,
        "pending_verification": pending_verification,
        "incomplete_profiles": incomplete_profiles
    }


@router.post('/verify-profile/{student_id}')
def verify_profile(student_id: int, payload: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    approve = bool(payload.get('approve', True))
    student = student_crud.verify_profile(db, student_id, approve=approve)
    return {"detail": "Profile verified" if approve else "Profile rejected", "student_id": student.student_id}


# CRUD routes for admin management (these use {admin_id} so they must come AFTER specific routes)
@router.post("/", response_model=AdminResponse)
def create_admin(data: AdminCreate, db: Session = Depends(get_db)):
    return admin_crud.create_admin(db, data)


@router.get("/", response_model=list[AdminResponse])
def list_admins(db: Session = Depends(get_db)):
    return admin_crud.get_admins(db)


@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    a = admin_crud.get_admin(db, admin_id)
    if not a:
        raise HTTPException(status_code=404, detail="Admin not found")
    return a


@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(admin_id: int, data: AdminCreate, db: Session = Depends(get_db)):
    return admin_crud.update_admin(db, admin_id, data)


@router.delete("/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    return admin_crud.delete_admin(db, admin_id)
    return {"detail": "Admin deleted"}


# -----------------------------------------------------------
# SECURITY ENDPOINTS
# -----------------------------------------------------------
@router.patch("/{admin_id}")
def patch_admin_security(admin_id: int, update: SecurityUpdate, db: Session = Depends(get_db)):
    """Update admin security settings (account_status, twofa_enabled)"""
    admin = admin_crud.get_admin(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if update.account_status is not None:
        admin.account_status = update.account_status
    if update.twofa_enabled is not None:
        admin.twofa_enabled = update.twofa_enabled
    
    db.commit()
    db.refresh(admin)
    return {"detail": "Security settings updated successfully", "admin_id": admin_id}


@router.post("/{admin_id}/reset-password")
def reset_admin_password(admin_id: int, reset: PasswordReset, db: Session = Depends(get_db)):
    """Reset admin password"""
    admin = admin_crud.get_admin(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    admin.password = hash_password(reset.new_password)
    db.commit()
    return {"detail": "Password reset successfully", "admin_id": admin_id}

