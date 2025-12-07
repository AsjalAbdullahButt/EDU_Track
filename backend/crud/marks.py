from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import marks as marks_crud
from schemas import MarksCreate, MarksUpdate, MarksResponse

router = APIRouter(prefix="/marks", tags=["Marks"])


@router.post("/", response_model=MarksResponse)
def create_mark(data: MarksCreate, db: Session = Depends(get_db)):
    """Create a new marks record"""
    return marks_crud.create_mark(db, data)


@router.get("/", response_model=list[MarksResponse])
def list_marks(db: Session = Depends(get_db)):
    """Get all marks records"""
    return marks_crud.get_all_marks(db)


@router.get("/student/{student_id}", response_model=list[MarksResponse])
def get_student_marks(student_id: int, db: Session = Depends(get_db)):
    """Get all marks for a specific student"""
    return marks_crud.get_student_marks(db, student_id)


@router.get("/course/{course_id}", response_model=list[MarksResponse])
def get_course_marks(course_id: int, db: Session = Depends(get_db)):
    """Get all marks for a specific course"""
    return marks_crud.get_course_marks(db, course_id)


@router.get("/semester/{semester}", response_model=list[MarksResponse])
def get_semester_marks(semester: int, db: Session = Depends(get_db)):
    """Get all marks for a specific semester"""
    return marks_crud.get_semester_marks(db, semester)


@router.get("/student/{student_id}/course/{course_id}", response_model=list[MarksResponse])
def get_student_course_marks(student_id: int, course_id: int, db: Session = Depends(get_db)):
    """Get marks for a specific student-course combination"""
    return marks_crud.get_student_course_marks(db, student_id, course_id)


@router.get("/{mark_id}", response_model=MarksResponse)
def get_mark(mark_id: int, db: Session = Depends(get_db)):
    """Get a specific marks record by ID"""
    mark = marks_crud.get_mark(db, mark_id)
    if not mark:
        raise HTTPException(status_code=404, detail="Marks record not found")
    return mark


@router.put("/{mark_id}", response_model=MarksResponse)
def update_mark(mark_id: int, data: MarksUpdate, db: Session = Depends(get_db)):
    """Update a marks record"""
    return marks_crud.update_mark(db, mark_id, data)


@router.delete("/{mark_id}")
def delete_mark(mark_id: int, db: Session = Depends(get_db)):
    """Delete a marks record"""
    return marks_crud.delete_mark(db, mark_id)
