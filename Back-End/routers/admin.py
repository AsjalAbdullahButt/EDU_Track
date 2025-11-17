from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud.admin as admin_crud
from schemas import AdminCreate, AdminResponse

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
