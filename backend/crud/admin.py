from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models import Admin
from backend.schemas import AdminCreate

def create_admin(db: Session, data: AdminCreate):
    obj = Admin(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_admins(db: Session):
    return db.query(Admin).all()

def get_admin(db: Session, admin_id: int):
    return db.query(Admin).filter(Admin.admin_id == admin_id).first()

def update_admin(db: Session, admin_id: int, data: AdminCreate):
    admin = get_admin(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    for k, v in data.dict().items():
        setattr(admin, k, v)
    db.commit()
    db.refresh(admin)
    return admin

def delete_admin(db: Session, admin_id: int):
    admin = get_admin(db, admin_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db.delete(admin)
    db.commit()
    return {"detail": "Admin deleted"}
