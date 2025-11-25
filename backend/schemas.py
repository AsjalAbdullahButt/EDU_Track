from pydantic import BaseModel
from datetime import date, datetime


# -----------------------------------------------------------
# STUDENT
# -----------------------------------------------------------
class StudentBase(BaseModel):
    full_name: str
    email: str
    password: str
    gender: str | None = None
    dob: date | None = None
    department: str | None = None
    semester: int | None = None
    contact: str | None = None
    address: str | None = None


class StudentCreate(StudentBase):
    pass


class StudentResponse(StudentBase):
    student_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# FACULTY
# -----------------------------------------------------------
class FacultyBase(BaseModel):
    name: str
    email: str
    password: str
    department: str | None = None
    contact: str | None = None


class FacultyCreate(FacultyBase):
    pass


class FacultyResponse(FacultyBase):
    faculty_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# ADMIN
# -----------------------------------------------------------
class AdminBase(BaseModel):
    name: str
    email: str
    password: str


class AdminCreate(AdminBase):
    pass


class AdminResponse(AdminBase):
    admin_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# COURSE
# -----------------------------------------------------------
class CourseBase(BaseModel):
    course_name: str
    course_code: str
    credit_hours: int
    faculty_id: int | None = None


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    course_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# ENROLLMENT
# -----------------------------------------------------------
class EnrollmentBase(BaseModel):
    student_id: int
    course_id: int
    semester: int
    status: str | None = "Active"


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentResponse(EnrollmentBase):
    enrollment_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# ATTENDANCE
# -----------------------------------------------------------
class AttendanceBase(BaseModel):
    student_id: int
    course_id: int
    date: date
    status: str


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    attendance_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# GRADES
# -----------------------------------------------------------
class GradesBase(BaseModel):
    student_id: int
    course_id: int
    marks_obtained: float | None = None
    grade: str | None = None
    semester: int | None = None


class GradesCreate(GradesBase):
    pass


class GradesResponse(GradesBase):
    grade_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# FEE
# -----------------------------------------------------------
class FeeBase(BaseModel):
    student_id: int
    total_amount: float
    amount_paid: float | None = 0
    due_date: date | None = None
    status: str | None = "Pending"


class FeeCreate(FeeBase):
    pass


class FeeResponse(FeeBase):
    fee_id: int

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# NOTIFICATIONS
# -----------------------------------------------------------
class NotificationBase(BaseModel):
    sender_id: int | None = None
    recipient_id: int | None = None
    message: str
    type: str | None = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    notification_id: int
    date_sent: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# FEEDBACK
# -----------------------------------------------------------
class FeedbackBase(BaseModel):
    student_id: int
    faculty_id: int
    course_id: int
    message: str


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackResponse(FeedbackBase):
    feedback_id: int
    date_submitted: datetime

    class Config:
        from_attributes = True
