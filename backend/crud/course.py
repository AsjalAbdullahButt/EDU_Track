from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Course, Enrollment
from schemas import CourseCreate
from typing import Optional

def create_course(db: Session, data: CourseCreate):
    obj = Course(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_courses(db: Session, status: Optional[str] = None):
    """Get all courses, optionally filtered by status"""
    query = db.query(Course)
    if status:
        query = query.filter(Course.course_status == status)
    return query.all()

def get_student_enrolled_courses(db: Session, student_id: int):
    """Get all courses a student is enrolled in"""
    return db.query(Course).select_from(Course).join(
        Enrollment,
        Course.course_id == Enrollment.course_id
    ).filter(
        Enrollment.student_id == student_id,
        Enrollment.status == "Active"
    ).all()

def get_course(db: Session, course_id: int):
    return db.query(Course).filter(Course.course_id == course_id).first()

def update_course(db: Session, course_id: int, data: CourseCreate):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(course, k, v)
    db.commit()
    db.refresh(course)
    return course

def update_course_status(db: Session, course_id: int, status: str):
    """Update only the course status"""
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.course_status = status
    db.commit()
    db.refresh(course)
    return course

def delete_course(db: Session, course_id: int):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"detail": "Course deleted"}
