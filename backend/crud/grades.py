from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Grades, Marks
from schemas import GradesCreate

def calculate_weightage_and_grade(marks):
    """Calculate total weightage and grade from marks"""
    if not marks:
        return 0.00, 'F'
    
    # Calculate weightages
    quiz_weightage = sum([
        (float(marks.quiz1 or 0) / 100) * 3.333,
        (float(marks.quiz2 or 0) / 100) * 3.333,
        (float(marks.quiz3 or 0) / 100) * 3.333
    ])
    
    assignment_weightage = sum([
        (float(marks.assignment1 or 0) / 100) * 3.333,
        (float(marks.assignment2 or 0) / 100) * 3.333,
        (float(marks.assignment3 or 0) / 100) * 3.333
    ])
    
    midterm1_weightage = (float(marks.midterm1 or 0) / 100) * 15
    midterm2_weightage = (float(marks.midterm2 or 0) / 100) * 15
    final_weightage = (float(marks.final_exam or 0) / 100) * 50
    
    total_weightage = quiz_weightage + assignment_weightage + midterm1_weightage + midterm2_weightage + final_weightage
    
    # Determine grade
    if total_weightage >= 85:
        grade = 'A+'
    elif total_weightage >= 80:
        grade = 'A'
    elif total_weightage >= 75:
        grade = 'B+'
    elif total_weightage >= 70:
        grade = 'B'
    elif total_weightage >= 65:
        grade = 'C+'
    elif total_weightage >= 60:
        grade = 'C'
    elif total_weightage >= 55:
        grade = 'D'
    else:
        grade = 'F'
    
    return round(total_weightage, 2), grade

def create_grade(db: Session, data: GradesCreate):
    obj = Grades(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_grades(db: Session):
    """Get all grades with calculated marks from Marks table"""
    grades = db.query(Grades).all()
    result = []
    for grade in grades:
        marks = db.query(Marks).filter(
            Marks.student_id == grade.student_id,
            Marks.course_id == grade.course_id
        ).first()
        
        if marks:
            total_weightage, calculated_grade = calculate_weightage_and_grade(marks)
            grade.marks_obtained = total_weightage
            grade.grade = calculated_grade
        
        result.append(grade)
    
    return result

def get_student_grades(db: Session, student_id: int):
    """Get all grades for a specific student with calculated marks from Marks table"""
    grades = db.query(Grades).filter(Grades.student_id == student_id).all()
    result = []
    for grade in grades:
        marks = db.query(Marks).filter(
            Marks.student_id == grade.student_id,
            Marks.course_id == grade.course_id
        ).first()
        
        if marks:
            total_weightage, calculated_grade = calculate_weightage_and_grade(marks)
            grade.marks_obtained = total_weightage
            grade.grade = calculated_grade
        
        result.append(grade)
    
    return result

def get_grade(db: Session, grade_id: int):
    return db.query(Grades).filter(Grades.grade_id == grade_id).first()

def update_grade(db: Session, grade_id: int, data: GradesCreate):
    g = get_grade(db, grade_id)
    if not g:
        raise HTTPException(status_code=404, detail="Grade record not found")
    for k, v in data.dict().items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return g

def delete_grade(db: Session, grade_id: int):
    g = get_grade(db, grade_id)
    if not g:
        raise HTTPException(status_code=404, detail="Grade record not found")
    db.delete(g)
    db.commit()
    return {"detail": "Grade deleted"}
