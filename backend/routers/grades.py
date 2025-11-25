from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import grades as grades_crud
from backend.schemas import GradesCreate, GradesResponse

router = APIRouter(prefix="/grades", tags=["Grades"])

@router.post("/", response_model=GradesResponse)
def create_grade(data: GradesCreate, db: Session = Depends(get_db)):
    return grades_crud.create_grade(db, data)

@router.get("/", response_model=list[GradesResponse])
def list_grades(db: Session = Depends(get_db)):
    return grades_crud.get_grades(db)

@router.get("/{grade_id}", response_model=GradesResponse)
def get_grade(grade_id: int, db: Session = Depends(get_db)):
    g = grades_crud.get_grade(db, grade_id)
    if not g:
        raise HTTPException(status_code=404, detail="Grade not found")
    return g

@router.put("/{grade_id}", response_model=GradesResponse)
def update_grade(grade_id: int, data: GradesCreate, db: Session = Depends(get_db)):
    return grades_crud.update_grade(db, grade_id, data)

@router.delete("/{grade_id}")
def delete_grade(grade_id: int, db: Session = Depends(get_db)):
    return grades_crud.delete_grade(db, grade_id)
