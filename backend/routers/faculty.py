from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from crud import faculty as faculty_crud
from schemas import FacultyCreate, FacultyResponse, CourseResponse
from models import Course, Feedback, Enrollment

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


@router.get("/{faculty_id}/dashboard/stats")
def get_faculty_dashboard_stats(faculty_id: int, db: Session = Depends(get_db)):
    """Return faculty dashboard statistics"""
    total_courses = db.query(func.count(Course.course_id)).filter(
        Course.faculty_id == faculty_id
    ).scalar() or 0
    
    course_ids = [c.course_id for c in db.query(Course.course_id).filter(Course.faculty_id == faculty_id).all()]
    
    total_students = db.query(func.count(Enrollment.enrollment_id.distinct())).filter(
        Enrollment.course_id.in_(course_ids),
        Enrollment.status == "Active"
    ).scalar() or 0 if course_ids else 0
    
    pending_feedback = db.query(func.count(Feedback.feedback_id)).filter(
        Feedback.faculty_id == faculty_id
    ).scalar() or 0
    
    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "pending_feedback": pending_feedback
    }


@router.get("/{faculty_id}/courses", response_model=list[CourseResponse])
def get_faculty_courses(faculty_id: int, db: Session = Depends(get_db)):
    """Get all courses taught by a faculty member"""
    courses = db.query(Course).filter(Course.faculty_id == faculty_id).all()
    return courses
