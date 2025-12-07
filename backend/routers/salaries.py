from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import salaries as salaries_crud
from datetime import datetime

router = APIRouter(prefix="/salaries", tags=["Salaries"])


@router.get("/")
def list_salaries(skip: int = Query(0, ge=0), limit: int = Query(50, ge=1), db: Session = Depends(get_db)):
    return salaries_crud.get_salaries(db, skip=skip, limit=limit)


@router.get("/faculty/{faculty_id}")
def get_faculty_salaries(faculty_id: int, db: Session = Depends(get_db)):
    """Get all salary records for a specific faculty member"""
    return salaries_crud.get_faculty_salaries(db, faculty_id)


@router.get("/{salary_id}")
def get_salary(salary_id: int, db: Session = Depends(get_db)):
    """Get a specific salary record by ID"""
    salary = salaries_crud.get_salary(db, salary_id)
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return salary


@router.post("/")
def create_salary(payload: dict, db: Session = Depends(get_db)):
    faculty_id = payload.get('faculty_id')
    amount = payload.get('amount')
    status = payload.get('status', 'pending')
    payment_date = payload.get('payment_date')
    
    if not faculty_id or not amount:
        raise HTTPException(status_code=400, detail="faculty_id and amount are required")
    
    if payment_date:
        try:
            payment_date = datetime.fromisoformat(payment_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payment_date format")
    else:
        payment_date = datetime.utcnow() if status == 'completed' or status == 'paid' else None
    
    return salaries_crud.create_salary(db, faculty_id=faculty_id, amount=amount, payment_date=payment_date, status=status)


@router.put("/{salary_id}")
def update_salary(salary_id: int, payload: dict, db: Session = Depends(get_db)):
    """Update a salary record (approve payment, update status, etc.)"""
    salary = salaries_crud.get_salary(db, salary_id)
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    
    # Update fields from payload
    if 'status' in payload or 'payment_status' in payload:
        new_status = payload.get('status') or payload.get('payment_status')
        if new_status:
            salary.status = new_status.lower()
            # If marking as paid/completed, set payment_date if not already set
            if new_status.lower() in ['paid', 'completed'] and not salary.payment_date:
                salary.payment_date = datetime.utcnow()
    
    if 'payment_date' in payload and payload['payment_date']:
        try:
            salary.payment_date = datetime.fromisoformat(payload['payment_date'].replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payment_date format")
    
    if 'amount' in payload:
        salary.amount = payload['amount']
    
    db.commit()
    db.refresh(salary)
    return salary


@router.delete("/{salary_id}")
def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    """Delete a salary record"""
    return salaries_crud.delete_salary(db, salary_id)
