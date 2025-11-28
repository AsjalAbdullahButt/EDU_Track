from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import student as student_crud
from backend.schemas import StudentCreate, StudentResponse

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
