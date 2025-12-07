from database import SessionLocal
from models import Grades, Student, Course, Faculty

db = SessionLocal()

print('=== FACULTY INFO ===')
faculty = db.query(Faculty).filter(Faculty.email == 'imran@faculty.com').first()
if faculty:
    print(f'Faculty: {faculty.name}, ID: {faculty.faculty_id}')
    
    print('\n=== FACULTY COURSES ===')
    courses = db.query(Course).filter(Course.faculty_id == faculty.faculty_id).all()
    for c in courses:
        print(f'Course ID: {c.course_id}, Code: {c.course_code}, Name: {c.course_name}')
    
    print('\n=== GRADES FOR THESE COURSES ===')
    course_ids = [c.course_id for c in courses]
    
    for c in courses:
        print(f'\n--- {c.course_code} ({c.course_name}) ---')
        grades = db.query(Grades, Student).join(
            Student, Grades.student_id == Student.student_id
        ).filter(Grades.course_id == c.course_id).all()
        
        if grades:
            for g, s in grades:
                print(f'  Student ID: {g.student_id}, Name: {s.full_name}, Grade: {g.grade}, Marks: {g.marks_obtained}, Semester: {g.semester}, Date: {g.created_at}')
        else:
            print('  No grades found')
    
    print('\n=== SUMMARY ===')
    total_grades = db.query(Grades).filter(Grades.course_id.in_(course_ids)).count()
    print(f'Total grades for faculty courses: {total_grades}')
else:
    print('Faculty not found!')

db.close()
