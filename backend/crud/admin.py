from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Admin
from schemas import AdminCreate
from security import hash_password

def create_admin(db: Session, data: AdminCreate):
    admin_data = data.dict()
    admin_data['password'] = hash_password(admin_data['password'])
    obj = Admin(**admin_data)
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
    
    update_data = data.dict()
    if 'password' in update_data and update_data['password']:
        update_data['password'] = hash_password(update_data['password'])
    
    for k, v in update_data.items():
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
