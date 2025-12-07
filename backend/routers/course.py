from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from crud import course as course_crud
from schemas import CourseCreate, CourseResponse
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/courses", tags=["Courses"])

class CourseStatusUpdate(BaseModel):
    course_status: str

@router.post("/", response_model=CourseResponse)
def create_course(data: CourseCreate, db: Session = Depends(get_db)):
    return course_crud.create_course(db, data)

@router.get("/", response_model=list[CourseResponse])
def list_courses(status: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all courses, optionally filtered by status (Pending, Active, Rejected)"""
    return course_crud.get_courses(db, status)

@router.get("/student/{student_id}", response_model=list[CourseResponse])
def get_student_courses(student_id: int, db: Session = Depends(get_db)):
    """Get all courses a student is enrolled in"""
    return course_crud.get_student_enrolled_courses(db, student_id)

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    c = course_crud.get_course(db, course_id)
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return c

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, data: CourseCreate, db: Session = Depends(get_db)):
    return course_crud.update_course(db, course_id, data)

@router.patch("/{course_id}/status", response_model=CourseResponse)
def update_course_status(course_id: int, data: CourseStatusUpdate, db: Session = Depends(get_db)):
    """Update only the course status"""
    return course_crud.update_course_status(db, course_id, data.course_status)

@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    return course_crud.delete_course(db, course_id)
