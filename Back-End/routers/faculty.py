from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud.faculty as faculty_crud
from schemas import FacultyCreate, FacultyResponse

router = APIRouter(prefix="/faculties", tags=["Faculty"])

@router.post("/", response_model=FacultyResponse)
def create_faculty(data: FacultyCreate, db: Session = Depends(get_db)):
    return faculty_crud.create_faculty(db, data)

@router.get("/", response_model=list[FacultyResponse])
def list_faculties(db: Session = Depends(get_db)):
    return faculty_crud.get_faculties(db)

@router.get("/{faculty_id}", response_model=FacultyResponse)
def get_faculty(faculty_id: int, db: Session = Depends(get_db)):
    f = faculty_crud.get_faculty(db, faculty_id)
    if not f:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return f

@router.put("/{faculty_id}", response_model=FacultyResponse)
def update_faculty(faculty_id: int, data: FacultyCreate, db: Session = Depends(get_db)):
    return faculty_crud.update_faculty(db, faculty_id, data)

@router.delete("/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    return faculty_crud.delete_faculty(db, faculty_id)
