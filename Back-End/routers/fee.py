from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud.fee as fee_crud
from schemas import FeeCreate, FeeResponse

router = APIRouter(prefix="/fees", tags=["Fees"])

@router.post("/", response_model=FeeResponse)
def create_fee(data: FeeCreate, db: Session = Depends(get_db)):
    return fee_crud.create_fee(db, data)

@router.get("/", response_model=list[FeeResponse])
def list_fees(db: Session = Depends(get_db)):
    return fee_crud.get_fees(db)

@router.get("/{fee_id}", response_model=FeeResponse)
def get_fee(fee_id: int, db: Session = Depends(get_db)):
    f = fee_crud.get_fee(db, fee_id)
    if not f:
        raise HTTPException(status_code=404, detail="Fee record not found")
    return f

@router.put("/{fee_id}", response_model=FeeResponse)
def update_fee(fee_id: int, data: FeeCreate, db: Session = Depends(get_db)):
    return fee_crud.update_fee(db, fee_id, data)

@router.delete("/{fee_id}")
def delete_fee(fee_id: int, db: Session = Depends(get_db)):
    return fee_crud.delete_fee(db, fee_id)
