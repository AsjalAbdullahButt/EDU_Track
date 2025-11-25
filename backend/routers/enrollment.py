from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import enrollment as enrollment_crud
from backend.schemas import EnrollmentCreate, EnrollmentResponse

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("/", response_model=EnrollmentResponse)
def create_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db)):
    return enrollment_crud.create_enrollment(db, data)

@router.get("/", response_model=list[EnrollmentResponse])
def list_enrollments(db: Session = Depends(get_db)):
    return enrollment_crud.get_enrollments(db)

@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    e = enrollment_crud.get_enrollment(db, enrollment_id)
    if not e:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return e

@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment(enrollment_id: int, data: EnrollmentCreate, db: Session = Depends(get_db)):
    return enrollment_crud.update_enrollment(db, enrollment_id, data)

@router.delete("/{enrollment_id}")
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    return enrollment_crud.delete_enrollment(db, enrollment_id)
