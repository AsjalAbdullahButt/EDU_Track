from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import admin as admin_crud
from backend.schemas import AdminCreate, AdminResponse
from backend.crud import student as student_crud
from backend.schemas import StudentResponse


def require_admin(x_user_role: str | None = Header(None)):
    """Simple header-based admin guard. Frontend should send `x-user-role: admin` header."""
    if x_user_role != 'admin':
        raise HTTPException(status_code=403, detail="Admin privileges required")

router = APIRouter(prefix="/admins", tags=["Admin"])

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


@router.get('/pending-profiles', response_model=list[StudentResponse])
def pending_profiles(db: Session = Depends(get_db), _=Depends(require_admin)):
    return student_crud.list_pending_profiles(db)


@router.post('/verify-profile/{student_id}')
def verify_profile(student_id: int, payload: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    approve = bool(payload.get('approve', True))
    student = student_crud.verify_profile(db, student_id, approve=approve)
    return {"detail": "Profile verified" if approve else "Profile rejected", "student_id": student.student_id}
