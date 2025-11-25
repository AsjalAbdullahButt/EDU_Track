from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.crud import course as course_crud
from backend.schemas import CourseCreate, CourseResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("/", response_model=CourseResponse)
def create_course(data: CourseCreate, db: Session = Depends(get_db)):
    return course_crud.create_course(db, data)

@router.get("/", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return course_crud.get_courses(db)

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    c = course_crud.get_course(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return c

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, data: CourseCreate, db: Session = Depends(get_db)):
    return course_crud.update_course(db, course_id, data)

@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    return course_crud.delete_course(db, course_id)
