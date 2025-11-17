from fastapi import FastAPI
#from database import Base, engine
# import routers.student as student_router
# import routers.faculty as faculty_router
# import routers.admin as admin_router
# import routers.course as course_router
# import routers.enrollment as enrollment_router
# import routers.attendence as attendance_router
# import routers.grades as grades_router
# import routers.fee as fee_router
# import routers.notifications as notifications_router
# import routers.feedback as feedback_router


# # Create all tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="EDU-Track API")


# Register all routers
# app.include_router(student_router.router)
# app.include_router(faculty_router.router)
# app.include_router(admin_router.router)
# app.include_router(course_router.router)
# app.include_router(enrollment_router.router)
# app.include_router(attendance_router.router)
# app.include_router(grades_router.router)
# app.include_router(fee_router.router)
# app.include_router(notifications_router.router)
# app.include_router(feedback_router.router)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import db_cursor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Use a plain dict for incoming student data (no pydantic model required)
Student = dict

@app.post("/students")
def add_student(student: dict):  # receive object from frontend
    with db_cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO STUDENT 
            (FULL_NAME, EMAIL, PASSWORD, GENDER, DOB, DEPARTMENT, SEMESTER, CONTACT, ADDRESS)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (
                student.get("FULL_NAME"),
                student.get("EMAIL"),
                student.get("PASSWORD"),
                student.get("GENDER"),
                student.get("DOB"),
                student.get("DEPARTMENT"),
                student.get("SEMESTER"),
                student.get("CONTACT"),
                student.get("ADDRESS")
            )
        )
    return {"status": "success", "message": f"Student '{student.get('FULL_NAME')}' added successfully."}


@app.get("/students")
def get_students():
    with db_cursor() as cursor:
        print("Fetching students from database")
        cursor.execute("SELECT * FROM Student;")
        return cursor.fetchall()