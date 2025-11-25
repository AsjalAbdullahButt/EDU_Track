from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import salaries as salaries_crud

router = APIRouter(prefix="/api/admin", tags=["Admin" ] )


@router.get("/salaries")
def list_salaries(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1), db: Session = Depends(get_db)):
    return salaries_crud.get_salaries(db, skip=skip, limit=limit)


@router.post("/salaries")
def create_salary(payload: dict, db: Session = Depends(get_db)):
    faculty_id = payload.get('faculty_id')
    amount = payload.get('amount')
    status = payload.get('status', 'pending')
    from datetime import datetime
    return salaries_crud.create_salary(db, faculty_id=faculty_id, amount=amount, payment_date=datetime.utcnow(), status=status)
