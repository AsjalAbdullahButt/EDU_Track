from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Marks
from schemas import MarksCreate, MarksUpdate


def create_mark(db: Session, data: MarksCreate):
    """Create a new marks record"""
    # Check if marks already exist for this student-course-semester combination
    existing = db.query(Marks).filter(
        Marks.student_id == data.student_id,
        Marks.course_id == data.course_id,
        Marks.semester == data.semester
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Marks record already exists for this student-course-semester combination"
        )
    
    obj = Marks(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_all_marks(db: Session):
    """Get all marks records"""
    return db.query(Marks).all()


def get_student_marks(db: Session, student_id: int):
    """Get all marks for a specific student"""
    return db.query(Marks).filter(Marks.student_id == student_id).all()


def get_course_marks(db: Session, course_id: int):
    """Get all marks for a specific course"""
    return db.query(Marks).filter(Marks.course_id == course_id).all()


def get_student_course_marks(db: Session, student_id: int, course_id: int):
    """Get marks for a specific student-course combination"""
    return db.query(Marks).filter(
        Marks.student_id == student_id,
        Marks.course_id == course_id
    ).all()


def get_mark(db: Session, mark_id: int):
    """Get a specific mark record by ID"""
    return db.query(Marks).filter(Marks.mark_id == mark_id).first()


def update_mark(db: Session, mark_id: int, data: MarksUpdate):
    """Update a marks record"""
    mark = get_mark(db, mark_id)
    if not mark:
        raise HTTPException(status_code=404, detail="Marks record not found")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(mark, key, value)
    
    db.commit()
    db.refresh(mark)
    return mark


def delete_mark(db: Session, mark_id: int):
    """Delete a marks record"""
    mark = get_mark(db, mark_id)
    if not mark:
        raise HTTPException(status_code=404, detail="Marks record not found")
    
    db.delete(mark)
    db.commit()
    return {"detail": "Marks record deleted"}


def get_semester_marks(db: Session, semester: int):
    """Get all marks for a specific semester"""
    return db.query(Marks).filter(Marks.semester == semester).all()
