from sqlalchemy import (
    Column, Integer, String, Date, DateTime,
    DECIMAL, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime


# -----------------------------------------------------------
# STUDENT
# -----------------------------------------------------------
class Student(Base):
    __tablename__ = "Student"

    student_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    gender = Column(String(10))
    dob = Column(Date)
    department = Column(String(50))
    semester = Column(Integer)
    contact = Column(String(20))
    address = Column(String(255))
    role = Column(String(20), default="student")
    profile_verified = Column(Boolean, default=False)
    verification_status = Column(String(20), default="unverified")

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")
    grades = relationship("Grades", back_populates="student")
    fees = relationship("Fee", back_populates="student")
    feedback = relationship("Feedback", back_populates="student")


# -----------------------------------------------------------
# FACULTY
# -----------------------------------------------------------
class Faculty(Base):
    __tablename__ = "Faculty"

    faculty_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    department = Column(String(50))
    contact = Column(String(20))
    role = Column(String(20), default="faculty")

    courses = relationship("Course", back_populates="faculty")
    feedback = relationship("Feedback", back_populates="faculty")


# -----------------------------------------------------------
# ADMIN
# -----------------------------------------------------------
class Admin(Base):
    __tablename__ = "Admin"

    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), default="admin")


# -----------------------------------------------------------
# COURSE
# -----------------------------------------------------------
class Course(Base):
    __tablename__ = "Course"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    course_code = Column(String(20), unique=True, nullable=False)
    credit_hours = Column(Integer, nullable=False)

    faculty_id = Column(Integer, ForeignKey("Faculty.faculty_id"))
    faculty = relationship("Faculty", back_populates="courses")

    enrollments = relationship("Enrollment", back_populates="course")
    attendance = relationship("Attendance", back_populates="course")
    grades = relationship("Grades", back_populates="course")
    feedback = relationship("Feedback", back_populates="course")


# -----------------------------------------------------------
# ENROLLMENT
# -----------------------------------------------------------
class Enrollment(Base):
    __tablename__ = "Enrollment"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("Student.student_id"))
    course_id = Column(Integer, ForeignKey("Course.course_id"))
    semester = Column(Integer, nullable=False)
    status = Column(String(20), default="Active")

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


# -----------------------------------------------------------
# ATTENDANCE
# -----------------------------------------------------------
class Attendance(Base):
    __tablename__ = "Attendance"

    attendance_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("Student.student_id"))
    course_id = Column(Integer, ForeignKey("Course.course_id"))
    date = Column(Date, nullable=False)
    status = Column(String(10), nullable=False)

    student = relationship("Student", back_populates="attendance")
    course = relationship("Course", back_populates="attendance")


# -----------------------------------------------------------
# GRADES
# -----------------------------------------------------------
class Grades(Base):
    __tablename__ = "Grades"

    grade_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("Student.student_id"))
    course_id = Column(Integer, ForeignKey("Course.course_id"))
    marks_obtained = Column(DECIMAL(5, 2))
    grade = Column(String(2))
    semester = Column(Integer)

    student = relationship("Student", back_populates="grades")
    course = relationship("Course", back_populates="grades")


# -----------------------------------------------------------
# FEE
# -----------------------------------------------------------
class Fee(Base):
    __tablename__ = "Fee"

    fee_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("Student.student_id"))
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    amount_paid = Column(DECIMAL(10, 2), default=0)
    due_date = Column(Date)
    status = Column(String(20), default="Pending")

    student = relationship("Student", back_populates="fees")


# -----------------------------------------------------------
# NOTIFICATIONS
# -----------------------------------------------------------
class Notifications(Base):
    __tablename__ = "Notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer)  # Admin or Faculty
    recipient_id = Column(Integer)  # Student
    message = Column(String(255), nullable=False)
    date_sent = Column(DateTime, default=datetime.utcnow)
    type = Column(String(20))


# -----------------------------------------------------------
# FEEDBACK
# -----------------------------------------------------------
class Feedback(Base):
    __tablename__ = "Feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("Student.student_id"))
    faculty_id = Column(Integer, ForeignKey("Faculty.faculty_id"))
    course_id = Column(Integer, ForeignKey("Course.course_id"))
    message = Column(String(255), nullable=False)
    date_submitted = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="feedback")
    faculty = relationship("Faculty", back_populates="feedback")
    course = relationship("Course", back_populates="feedback")


# -----------------------------------------------------------
# SALARY (Admin)
# -----------------------------------------------------------
class Salary(Base):
    __tablename__ = "Salary"

    salary_id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("Faculty.faculty_id"))
    payment_date = Column(DateTime)
    status = Column(String(20), default="pending")
    amount = Column(DECIMAL(10, 2), nullable=False)

    faculty = relationship("Faculty")
