from pydantic import BaseModel
from datetime import date, datetime


# -----------------------------------------------------------
# STUDENT
# -----------------------------------------------------------
class StudentBase(BaseModel):
    username: str | None = None
    full_name: str
    email: str
    password: str
    gender: str | None = None
    dob: date | None = None
    department: str | None = None
    semester: int | None = None
    contact: str | None = None
    address: str | None = None
    role: str = "student"


class StudentCreate(StudentBase):
    pass


class StudentResponse(StudentBase):
    student_id: int
    profile_verified: bool | None = False
    verification_status: str | None = "unverified"
    account_status: str | None = "Active"
    twofa_enabled: bool | None = False

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
    role: str = "faculty"


class FacultyCreate(FacultyBase):
    pass


class FacultyResponse(FacultyBase):
    faculty_id: int
    account_status: str | None = "Active"
    twofa_enabled: bool | None = False

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# ADMIN
# -----------------------------------------------------------
class AdminBase(BaseModel):
    name: str
    email: str
    password: str
    role: str = "admin"


class AdminCreate(AdminBase):
    pass


class AdminResponse(AdminBase):
    admin_id: int
    account_status: str | None = "Active"
    twofa_enabled: bool | None = False

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
    course_status: str | None = "Pending"
    description: str | None = None


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
    quiz_marks: float | None = 0
    mid_marks: float | None = 0
    assignment_marks: float | None = 0
    final_marks: float | None = 0
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
    student_id: int | None = None
    title: str = "Notification"
    message: str
    type: str | None = None
    is_read: bool = False


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    notification_id: int
    date_sent: datetime
    created_at: datetime

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


# -----------------------------------------------------------
# MARKS (Detailed Assessment Breakdown)
# -----------------------------------------------------------
class MarksBase(BaseModel):
    student_id: int
    course_id: int
    semester: int | None = None
    quiz1: float = 0.0
    quiz2: float = 0.0
    quiz3: float = 0.0
    quiz_total: float = 0.0
    assignment1: float = 0.0
    assignment2: float = 0.0
    assignment3: float = 0.0
    assignment_total: float = 0.0
    midterm1: float = 0.0
    midterm2: float = 0.0
    final_exam: float = 0.0
    total_marks: float = 0.0
    grade_letter: str | None = None


class MarksCreate(MarksBase):
    pass


class MarksUpdate(BaseModel):
    quiz1: float | None = None
    quiz2: float | None = None
    quiz3: float | None = None
    quiz_total: float | None = None
    assignment1: float | None = None
    assignment2: float | None = None
    assignment3: float | None = None
    assignment_total: float | None = None
    midterm1: float | None = None
    midterm2: float | None = None
    final_exam: float | None = None
    total_marks: float | None = None
    grade_letter: str | None = None

    class Config:
        from_attributes = True


class MarksResponse(MarksBase):
    mark_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------
# SECURITY UPDATE SCHEMAS
# -----------------------------------------------------------
class SecurityUpdate(BaseModel):
    """Schema for updating security settings"""
    account_status: str | None = None
    twofa_enabled: bool | None = None


class PasswordReset(BaseModel):
    """Schema for password reset"""
    new_password: str

