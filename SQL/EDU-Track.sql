-- ===========================================================
-- EDU-TRACK DATABASE SCHEMA
-- Fully compatible with FastAPI backend models
-- ===========================================================

-- Drop existing database and recreate for clean slate
DROP DATABASE IF EXISTS EDU_Track;
CREATE DATABASE EDU_Track;
USE EDU_Track;

-- ===========================================================
-- TABLE STRUCTURE (Based on backend/models.py)
-- ===========================================================

-- ----------------------------
-- STUDENT TABLE
-- ----------------------------
CREATE TABLE Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    dob DATE,
    department VARCHAR(50),
    semester INT,
    contact VARCHAR(20),
    address VARCHAR(255),
    role VARCHAR(20) DEFAULT 'student',
    profile_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_username (username),
    INDEX idx_student_email (email),
    INDEX idx_student_role (role),
    INDEX idx_student_department (department),
    INDEX idx_student_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- FACULTY TABLE
-- ----------------------------
CREATE TABLE Faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    contact VARCHAR(20),
    role VARCHAR(20) DEFAULT 'faculty',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_faculty_email (email),
    INDEX idx_faculty_role (role),
    INDEX idx_faculty_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- ADMIN TABLE
-- ----------------------------
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_email (email),
    INDEX idx_admin_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- COURSE TABLE
-- ----------------------------
CREATE TABLE Course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    credit_hours INT NOT NULL,
    faculty_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_course_code (course_code),
    INDEX idx_course_faculty_id (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- ENROLLMENT TABLE
-- ----------------------------
CREATE TABLE Enrollment (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_enrollment_student_id (student_id),
    INDEX idx_enrollment_course_id (course_id),
    INDEX idx_enrollment_status (status),
    INDEX idx_enrollment_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- ATTENDANCE TABLE
-- ----------------------------
CREATE TABLE Attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_attendance_student_id (student_id),
    INDEX idx_attendance_course_id (course_id),
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- GRADES TABLE
-- ----------------------------
CREATE TABLE Grades (
    grade_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    marks_obtained DECIMAL(5, 2),
    grade VARCHAR(2),
    semester INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_student_course_grade (student_id, course_id, semester),
    INDEX idx_grades_student_id (student_id),
    INDEX idx_grades_course_id (course_id),
    INDEX idx_grades_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- MARKS TABLE (Detailed Assessment Breakdown)
-- ----------------------------
-- Weightage Distribution:
-- Quizzes (Total 10): quiz1, quiz2, quiz3
-- Assignments (Total 10): assignment1, assignment2, assignment3
-- Midterm 1 (15 marks)
-- Midterm 2 (15 marks)
-- Final Exam (50 marks)
-- Total: 100 marks
-- ----------------------------
CREATE TABLE Marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester INT,
    
    -- Quiz Marks (Total: 10 out of 10)
    quiz1 DECIMAL(5, 2) DEFAULT 0.00,
    quiz2 DECIMAL(5, 2) DEFAULT 0.00,
    quiz3 DECIMAL(5, 2) DEFAULT 0.00,
    quiz_total DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Assignment Marks (Total: 10 out of 10)
    assignment1 DECIMAL(5, 2) DEFAULT 0.00,
    assignment2 DECIMAL(5, 2) DEFAULT 0.00,
    assignment3 DECIMAL(5, 2) DEFAULT 0.00,
    assignment_total DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Midterm Exams
    midterm1 DECIMAL(5, 2) DEFAULT 0.00,
    midterm2 DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Final Exam (50 marks)
    final_exam DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Total and Grade
    total_marks DECIMAL(5, 2) DEFAULT 0.00,
    grade_letter VARCHAR(2),
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint to prevent duplicate records
    UNIQUE KEY unique_student_course_marks (student_id, course_id, semester),
    
    -- Indexes for faster queries
    INDEX idx_marks_student_id (student_id),
    INDEX idx_marks_course_id (course_id),
    INDEX idx_marks_semester (semester),
    INDEX idx_marks_total (total_marks),
    INDEX idx_marks_grade (grade_letter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- FEE TABLE
-- ----------------------------
CREATE TABLE Fee (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_fee_student_id (student_id),
    INDEX idx_fee_status (status),
    INDEX idx_fee_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- NOTIFICATIONS TABLE
-- ----------------------------
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    recipient_id INT,
    student_id INT,
    title VARCHAR(255) NOT NULL DEFAULT 'Notification',
    message VARCHAR(500) NOT NULL,
    date_sent DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    INDEX idx_notifications_recipient_id (recipient_id),
    INDEX idx_notifications_student_id (student_id),
    INDEX idx_notifications_sender_id (sender_id),
    INDEX idx_notifications_date_sent (date_sent),
    INDEX idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- FEEDBACK TABLE
-- ----------------------------
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    faculty_id INT NOT NULL,
    course_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    date_submitted DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_feedback_student_id (student_id),
    INDEX idx_feedback_faculty_id (faculty_id),
    INDEX idx_feedback_course_id (course_id),
    INDEX idx_feedback_date (date_submitted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- SALARY TABLE
-- ----------------------------
CREATE TABLE Salary (
    salary_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    payment_date DATETIME,
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_salary_faculty_id (faculty_id),
    INDEX idx_salary_status (status),
    INDEX idx_salary_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================
-- COMPREHENSIVE TEST DATA
-- Passwords are bcrypt-hashed for security
-- Default password for all users: "password123"
-- ===========================================================

-- Disable foreign key checks for insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- ADMIN DATA
-- ----------------------------
-- Password: password123 (bcrypt hashed)
INSERT INTO Admin (admin_id, name, email, password, role) VALUES
(1, 'Super Admin', 'admin@edu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'admin'),
(2, 'System Administrator', 'sysadmin@edu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'admin'),
(3, 'Academic Head', 'academic@edu.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'admin');

-- ----------------------------
-- FACULTY DATA
-- ----------------------------
-- Password: password123 (bcrypt hashed)
INSERT INTO Faculty (faculty_id, name, email, password, department, contact, role) VALUES
(1, 'Dr. Imran Sheikh', 'imran@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Computer Science', '03001234567', 'faculty'),
(2, 'Dr. Nadia Khan', 'nadia@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Computer Science', '03002345678', 'faculty'),
(3, 'Dr. Saeed Rizvi', 'saeed@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Electrical Engineering', '03003456789', 'faculty'),
(4, 'Dr. Ahmed Hassan', 'ahmed@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Computer Science', '03004567890', 'faculty'),
(5, 'Prof. Maria Khan', 'maria@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Information Technology', '03005678901', 'faculty'),
(6, 'Dr. Ali Raza', 'aliraza@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Software Engineering', '03006789012', 'faculty'),
(7, 'Prof. Fatima Malik', 'fatima@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Software Engineering', '03007890123', 'faculty'),
(8, 'Dr. Usman Khan', 'usman@faculty.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Mechanical Engineering', '03008901234', 'faculty');

-- ----------------------------
-- STUDENT DATA
-- ----------------------------
-- Password: password123 (bcrypt hashed)
INSERT INTO Student (student_id, username, full_name, email, password, gender, dob, department, semester, contact, address, role, profile_verified, verification_status) VALUES
(1, 'asjal', 'Asjal Abdullah', 'asjal@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2002-05-12', 'Computer Science', 6, '03101234567', '123 University Road, Lahore', 'student', TRUE, 'verified'),
(2, 'ali', 'Ali Raza Khan', 'ali@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Male', '2001-11-03', 'Computer Science', 6, '03102345678', '456 Model Town, Lahore', 'student', TRUE, 'verified'),
(3, 'sara', 'Sara Ahmed', 'sara@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2003-02-17', 'Electrical Engineering', 4, '03103456789', '789 Garden Town, Lahore', 'student', TRUE, 'verified'),
(4, 'hira', 'Hira Ahmed', 'hira@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2003-12-10', 'Software Engineering', 4, '03104567890', '321 F-7, Islamabad', 'student', TRUE, 'verified'),
(5, 'hassan', 'Hassan Malik', 'hassan@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Male', '2004-03-25', 'Information Technology', 2, '03105678901', '654 Satellite Town, Rawalpindi', 'student', FALSE, 'pending'),
(6, 'sara2', 'Sara Ali', 'sara2@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2003-07-30', 'Computer Science', 5, '03106789012', '987 University Town, Peshawar', 'student', FALSE, 'pending'),
(7, 'waleed', 'Waleed Ahmad', 'waleed@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Male', '2002-09-15', 'Computer Science', 5, '03107890123', '159 DHA, Karachi', 'student', TRUE, 'verified'),
(8, 'ayesha', 'Ayesha Khan', 'ayesha@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2003-06-20', 'Information Technology', 3, '03108901234', '753 Clifton, Karachi', 'student', TRUE, 'verified'),
(9, 'usman', 'Usman Ahmed', 'usman@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Male', '2002-01-18', 'Software Engineering', 4, '03109012345', '951 Gulberg, Lahore', 'student', TRUE, 'verified'),
(10, 'fatima', 'Fatima Noor', 'fatima@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2004-04-10', 'Electrical Engineering', 2, '03110123456', '357 Johar Town, Lahore', 'student', FALSE, 'unverified'),
(11, 'zain', 'Zain ul Abideen', 'zain@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Male', '2003-11-05', 'Mechanical Engineering', 3, '03111234567', '246 Cantt, Rawalpindi', 'student', TRUE, 'verified'),
(12, 'maryam', 'Maryam Tariq', 'maryam@student.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNVr/pKam', 'Female', '2002-08-22', 'Computer Science', 6, '03112345678', '135 I-8, Islamabad', 'student', TRUE, 'verified');

-- ----------------------------
-- COURSE DATA
-- ----------------------------
INSERT INTO Course (course_id, course_name, course_code, credit_hours, faculty_id) VALUES
(1, 'Data Structures and Algorithms', 'CS201', 3, 1),
(2, 'Advanced Algorithms', 'CS301', 3, 1),
(3, 'Database Systems', 'CS401', 4, 2),
(4, 'Web Development', 'CS203', 3, 2),
(5, 'Machine Learning', 'CS501', 4, 4),
(6, 'Artificial Intelligence', 'CS502', 4, 4),
(7, 'Software Engineering', 'SE301', 3, 7),
(8, 'Operating Systems', 'CS302', 3, 1),
(9, 'Computer Networks', 'CS303', 3, 2),
(10, 'Mobile App Development', 'CS304', 3, 6),
(11, 'Circuit Analysis', 'EE101', 3, 3),
(12, 'Digital Logic Design', 'EE201', 3, 3),
(13, 'Thermodynamics', 'ME201', 3, 8),
(14, 'Cloud Computing', 'IT401', 3, 5),
(15, 'Cybersecurity', 'IT402', 3, 5);

-- ----------------------------
-- ENROLLMENT DATA
-- ----------------------------
-- Active enrollments for comprehensive testing
INSERT INTO Enrollment (student_id, course_id, semester, status) VALUES
-- Asjal Abdullah (Student ID 1) - 3 courses
(1, 2, 6, 'Active'),
(1, 3, 6, 'Active'),
(1, 4, 6, 'Active'),

-- Ali Raza Khan (Student ID 2) - 3 courses
(2, 1, 6, 'Active'),
(2, 2, 6, 'Active'),
(2, 3, 6, 'Active'),

-- Sara Ahmed (Student ID 3) - 1 course
(3, 11, 4, 'Active'),

-- Hira Ahmed (Student ID 4) - 2 courses
(4, 7, 4, 'Active'),
(4, 10, 4, 'Active'),

-- Hassan Malik (Student ID 5) - 4 courses
(5, 1, 2, 'Active'),
(5, 4, 2, 'Active'),
(5, 9, 2, 'Active'),
(5, 14, 2, 'Active'),

-- Sara Ali (Student ID 6) - 3 courses
(6, 3, 5, 'Active'),
(6, 8, 5, 'Active'),
(6, 9, 5, 'Active'),

-- Waleed Ahmad (Student ID 7) - 1 course
(7, 1, 5, 'Active'),

-- Ayesha Khan (Student ID 8) - 2 courses
(8, 14, 3, 'Active'),
(8, 15, 3, 'Active'),

-- Usman Ahmed (Student ID 9) - 3 courses
(9, 7, 4, 'Active'),
(9, 10, 4, 'Active'),
(9, 4, 4, 'Active'),

-- Fatima Noor (Student ID 10) - 2 courses
(10, 11, 2, 'Active'),
(10, 12, 2, 'Active'),

-- Zain ul Abideen (Student ID 11) - 1 course
(11, 13, 3, 'Active'),

-- Maryam Tariq (Student ID 12) - 4 courses
(12, 2, 6, 'Active'),
(12, 3, 6, 'Active'),
(12, 5, 6, 'Active'),
(12, 6, 6, 'Active');

-- ----------------------------
-- ATTENDANCE DATA
-- ----------------------------
-- Comprehensive attendance records for multiple students
INSERT INTO Attendance (student_id, course_id, date, status) VALUES
-- Asjal Abdullah - Course 2 (Algorithms)
(1, 2, '2025-11-01', 'Present'),
(1, 2, '2025-11-04', 'Present'),
(1, 2, '2025-11-08', 'Present'),
(1, 2, '2025-11-11', 'Absent'),
(1, 2, '2025-11-15', 'Present'),
(1, 2, '2025-11-18', 'Present'),
(1, 2, '2025-11-22', 'Present'),
(1, 2, '2025-11-25', 'Present'),
(1, 2, '2025-11-29', 'Absent'),
(1, 2, '2025-12-02', 'Present'),

-- Asjal Abdullah - Course 3 (Database)
(1, 3, '2025-11-02', 'Present'),
(1, 3, '2025-11-05', 'Present'),
(1, 3, '2025-11-09', 'Present'),
(1, 3, '2025-11-12', 'Present'),
(1, 3, '2025-11-16', 'Absent'),
(1, 3, '2025-11-19', 'Present'),
(1, 3, '2025-11-23', 'Present'),
(1, 3, '2025-11-26', 'Present'),
(1, 3, '2025-11-30', 'Present'),
(1, 3, '2025-12-03', 'Present'),

-- Asjal Abdullah - Course 4 (Web Development)
(1, 4, '2025-11-03', 'Present'),
(1, 4, '2025-11-06', 'Present'),
(1, 4, '2025-11-10', 'Present'),
(1, 4, '2025-11-13', 'Present'),
(1, 4, '2025-11-17', 'Present'),
(1, 4, '2025-11-20', 'Present'),
(1, 4, '2025-11-24', 'Absent'),
(1, 4, '2025-11-27', 'Present'),
(1, 4, '2025-12-01', 'Present'),
(1, 4, '2025-12-04', 'Present'),

-- Ali Raza Khan - Course 1
(2, 1, '2025-11-01', 'Present'),
(2, 1, '2025-11-04', 'Present'),
(2, 1, '2025-11-08', 'Present'),
(2, 1, '2025-11-11', 'Present'),
(2, 1, '2025-11-15', 'Present'),
(2, 1, '2025-11-18', 'Present'),
(2, 1, '2025-11-22', 'Present'),
(2, 1, '2025-11-25', 'Present'),
(2, 1, '2025-11-29', 'Present'),
(2, 1, '2025-12-02', 'Present'),

-- Ali Raza Khan - Course 2
(2, 2, '2025-11-01', 'Present'),
(2, 2, '2025-11-04', 'Present'),
(2, 2, '2025-11-08', 'Present'),
(2, 2, '2025-11-11', 'Present'),
(2, 2, '2025-11-15', 'Present'),
(2, 2, '2025-11-18', 'Present'),
(2, 2, '2025-11-22', 'Present'),
(2, 2, '2025-11-25', 'Present'),
(2, 2, '2025-11-29', 'Present'),
(2, 2, '2025-12-02', 'Present'),

-- Ali Raza Khan - Course 3
(2, 3, '2025-11-02', 'Present'),
(2, 3, '2025-11-05', 'Present'),
(2, 3, '2025-11-09', 'Present'),
(2, 3, '2025-11-12', 'Present'),
(2, 3, '2025-11-16', 'Present'),
(2, 3, '2025-11-19', 'Present'),
(2, 3, '2025-11-23', 'Present'),
(2, 3, '2025-11-26', 'Present'),
(2, 3, '2025-11-30', 'Present'),
(2, 3, '2025-12-03', 'Present'),

-- Sara Ahmed - Course 11
(3, 11, '2025-11-01', 'Present'),
(3, 11, '2025-11-04', 'Present'),
(3, 11, '2025-11-08', 'Absent'),
(3, 11, '2025-11-11', 'Present'),
(3, 11, '2025-11-15', 'Present'),
(3, 11, '2025-11-18', 'Present'),
(3, 11, '2025-11-22', 'Absent'),
(3, 11, '2025-11-25', 'Present'),
(3, 11, '2025-11-29', 'Present'),
(3, 11, '2025-12-02', 'Present'),

-- Hira Ahmed - Course 7
(4, 7, '2025-11-01', 'Present'),
(4, 7, '2025-11-04', 'Absent'),
(4, 7, '2025-11-08', 'Present'),
(4, 7, '2025-11-11', 'Present'),
(4, 7, '2025-11-15', 'Absent'),
(4, 7, '2025-11-18', 'Present'),
(4, 7, '2025-11-22', 'Present'),
(4, 7, '2025-11-25', 'Present'),
(4, 7, '2025-11-29', 'Present'),
(4, 7, '2025-12-02', 'Present'),

-- Hira Ahmed - Course 10
(4, 10, '2025-11-02', 'Present'),
(4, 10, '2025-11-05', 'Present'),
(4, 10, '2025-11-09', 'Present'),
(4, 10, '2025-11-12', 'Present'),
(4, 10, '2025-11-16', 'Present'),
(4, 10, '2025-11-19', 'Present'),
(4, 10, '2025-11-23', 'Present'),
(4, 10, '2025-11-26', 'Absent'),
(4, 10, '2025-11-30', 'Present'),
(4, 10, '2025-12-03', 'Present');

-- ----------------------------
-- GRADES DATA
-- ----------------------------
-- Comprehensive grade records
INSERT INTO Grades (student_id, course_id, marks_obtained, grade, semester) VALUES
-- Asjal Abdullah
(1, 1, 85.50, 'A', 5),
(1, 5, 78.00, 'B+', 5),
(1, 6, 82.50, 'A-', 5),
(1, 9, 88.00, 'A', 5),

-- Ali Raza Khan
(2, 1, 92.00, 'A+', 6),
(2, 2, 90.50, 'A', 6),
(2, 3, 85.00, 'A', 6),

-- Sara Ahmed
(3, 3, 88.00, 'A', 3),

-- Hira Ahmed
(4, 8, 72.00, 'B-', 3),
(4, 10, 91.00, 'A', 4),

-- Hassan Malik - no grades yet (new student)

-- Sara Ali
(6, 1, 76.00, 'B', 4),
(6, 4, 81.00, 'A-', 4),

-- Waleed Ahmad - no grades yet

-- Ayesha Khan
(8, 14, 87.00, 'A', 3),
(8, 15, 84.00, 'A-', 3),

-- Usman Ahmed
(9, 7, 79.00, 'B+', 4),
(9, 10, 86.00, 'A', 4),

-- Fatima Noor - no grades yet (new student)

-- Zain ul Abideen
(11, 13, 68.00, 'C+', 3),

-- Maryam Tariq
(12, 1, 94.00, 'A+', 5),
(12, 2, 91.00, 'A', 5),
(12, 5, 89.00, 'A', 6);

-- ----------------------------
-- MARKS DATA (Detailed Assessment Breakdown)
-- ----------------------------
-- Weightage: Quizzes(10) + Assignments(10) + Midterm1(15) + Midterm2(15) + Final(50) = 100
INSERT INTO Marks (student_id, course_id, semester, quiz1, quiz2, quiz3, quiz_total, assignment1, assignment2, assignment3, assignment_total, midterm1, midterm2, final_exam, total_marks, grade_letter) VALUES

-- Asjal Abdullah (Student 1) - Course 2 (Advanced Algorithms)
(1, 2, 6, 3.2, 3.5, 3.3, 10.0, 3.0, 3.3, 3.7, 10.0, 14.0, 13.5, 45.0, 82.5, 'A'),

-- Asjal Abdullah (Student 1) - Course 3 (Database Systems)
(1, 3, 6, 3.5, 3.2, 3.0, 9.7, 3.2, 3.5, 3.0, 9.7, 14.5, 13.2, 42.0, 79.1, 'B+'),

-- Asjal Abdullah (Student 1) - Course 4 (Web Development)
(1, 4, 6, 3.8, 3.5, 3.7, 11.0, 3.3, 3.5, 3.5, 10.3, 14.0, 14.5, 48.0, 87.8, 'A'),

-- Ali Raza Khan (Student 2) - Course 1 (Data Structures)
(2, 1, 6, 3.5, 3.7, 3.8, 11.0, 3.5, 3.7, 3.8, 11.0, 14.5, 14.2, 48.5, 93.2, 'A+'),

-- Ali Raza Khan (Student 2) - Course 2 (Advanced Algorithms)
(2, 2, 6, 3.8, 3.7, 3.5, 11.0, 3.6, 3.5, 3.9, 11.0, 14.0, 13.8, 47.0, 91.8, 'A'),

-- Ali Raza Khan (Student 2) - Course 3 (Database Systems)
(2, 3, 6, 3.6, 3.5, 3.4, 10.5, 3.3, 3.4, 3.3, 10.0, 14.2, 13.5, 46.0, 89.2, 'A'),

-- Sara Ahmed (Student 3) - Course 11 (Circuit Analysis)
(3, 11, 4, 3.2, 3.0, 3.3, 9.5, 2.8, 3.0, 2.9, 8.7, 13.0, 12.5, 42.0, 82.7, 'A'),

-- Hira Ahmed (Student 4) - Course 7 (Software Engineering)
(4, 7, 4, 3.0, 2.8, 2.9, 8.7, 2.7, 2.8, 2.6, 8.1, 11.0, 12.0, 38.0, 71.8, 'B-'),

-- Hira Ahmed (Student 4) - Course 10 (Mobile App Development)
(4, 10, 4, 3.5, 3.6, 3.4, 10.5, 3.4, 3.5, 3.6, 10.5, 14.5, 14.0, 46.0, 91.5, 'A'),

-- Hassan Malik (Student 5) - Course 1 (Data Structures)
(5, 1, 2, 2.8, 2.9, 3.0, 8.7, 2.8, 2.9, 3.0, 8.7, 12.0, 11.5, 40.0, 78.9, 'B+'),

-- Hassan Malik (Student 5) - Course 4 (Web Development)
(5, 4, 2, 3.2, 3.1, 3.2, 9.5, 3.1, 3.2, 3.0, 9.3, 12.5, 12.8, 41.0, 84.1, 'A-'),

-- Hassan Malik (Student 5) - Course 9 (Computer Networks)
(5, 9, 2, 2.9, 3.0, 2.8, 8.7, 2.8, 2.9, 2.7, 8.4, 11.5, 12.0, 39.0, 77.6, 'B'),

-- Hassan Malik (Student 5) - Course 14 (Cloud Computing)
(5, 14, 2, 3.3, 3.4, 3.2, 9.9, 3.2, 3.3, 3.1, 9.6, 13.0, 13.2, 42.5, 85.2, 'A'),

-- Sara Ali (Student 6) - Course 1 (Data Structures)
(6, 1, 5, 3.0, 2.8, 2.9, 8.7, 2.9, 2.8, 2.9, 8.6, 11.5, 12.0, 39.5, 75.3, 'B'),

-- Sara Ali (Student 6) - Course 3 (Database Systems)
(6, 3, 5, 3.2, 3.3, 3.1, 9.6, 3.1, 3.2, 3.2, 9.5, 12.8, 13.0, 42.0, 84.9, 'A'),

-- Sara Ali (Student 6) - Course 8 (Operating Systems)
(6, 8, 5, 3.4, 3.5, 3.3, 10.2, 3.3, 3.4, 3.5, 10.2, 13.5, 13.0, 44.0, 87.9, 'A'),

-- Waleed Ahmad (Student 7) - Course 1 (Data Structures)
(7, 1, 5, 3.1, 3.0, 3.2, 9.3, 3.0, 3.1, 3.2, 9.3, 12.0, 12.5, 41.0, 84.1, 'A'),

-- Ayesha Khan (Student 8) - Course 14 (Cloud Computing)
(8, 14, 3, 3.4, 3.5, 3.3, 10.2, 3.4, 3.5, 3.3, 10.2, 13.5, 13.0, 45.0, 88.9, 'A'),

-- Ayesha Khan (Student 8) - Course 15 (Cybersecurity)
(8, 15, 3, 3.3, 3.2, 3.4, 9.9, 3.2, 3.3, 3.3, 9.8, 13.0, 12.8, 44.5, 85.0, 'A'),

-- Usman Ahmed (Student 9) - Course 4 (Web Development)
(9, 4, 4, 3.1, 3.2, 3.0, 9.3, 3.0, 3.1, 3.2, 9.3, 12.0, 12.5, 41.0, 81.1, 'A-'),

-- Usman Ahmed (Student 9) - Course 7 (Software Engineering)
(9, 7, 4, 3.0, 2.9, 3.1, 9.0, 2.9, 3.0, 3.1, 9.0, 11.5, 12.0, 38.0, 77.5, 'B'),

-- Usman Ahmed (Student 9) - Course 10 (Mobile App Development)
(9, 10, 4, 3.4, 3.5, 3.3, 10.2, 3.4, 3.5, 3.4, 10.3, 14.0, 13.5, 44.5, 86.5, 'A'),

-- Zain ul Abideen (Student 11) - Course 13 (Thermodynamics)
(11, 13, 3, 2.5, 2.6, 2.7, 7.8, 2.4, 2.5, 2.6, 7.5, 10.0, 10.5, 34.5, 68.3, 'C+'),

-- Maryam Tariq (Student 12) - Course 1 (Data Structures)
(12, 1, 6, 3.8, 3.9, 3.8, 11.5, 3.7, 3.8, 3.9, 11.4, 15.0, 14.5, 49.5, 94.9, 'A+'),

-- Maryam Tariq (Student 12) - Course 2 (Advanced Algorithms)
(12, 2, 6, 3.7, 3.8, 3.7, 11.2, 3.6, 3.7, 3.8, 11.1, 14.5, 14.2, 48.0, 91.0, 'A'),

-- Maryam Tariq (Student 12) - Course 5 (Machine Learning)
(12, 5, 6, 3.6, 3.7, 3.8, 11.1, 3.5, 3.6, 3.7, 10.8, 14.0, 13.8, 47.0, 89.7, 'A');

-- ----------------------------
-- FEE DATA
-- ----------------------------
-- Comprehensive fee records with various statuses
INSERT INTO Fee (student_id, total_amount, amount_paid, due_date, status) VALUES
-- Fully Paid
(2, 50000.00, 50000.00, '2025-09-15', 'Paid'),
(4, 50000.00, 50000.00, '2025-09-15', 'Paid'),
(8, 45000.00, 45000.00, '2025-10-01', 'Paid'),
(9, 50000.00, 50000.00, '2025-09-15', 'Paid'),
(11, 48000.00, 48000.00, '2025-10-01', 'Paid'),
(12, 50000.00, 50000.00, '2025-09-15', 'Paid'),

-- Partially Paid
(1, 50000.00, 25000.00, '2025-12-31', 'Pending'),
(3, 45000.00, 20000.00, '2025-12-15', 'Pending'),
(6, 50000.00, 30000.00, '2025-12-20', 'Pending'),

-- Unpaid
(5, 48000.00, 0.00, '2025-12-31', 'Pending'),
(7, 50000.00, 0.00, '2026-01-15', 'Pending'),
(10, 45000.00, 0.00, '2026-01-31', 'Pending');

-- ----------------------------
-- NOTIFICATIONS DATA
-- ----------------------------
-- Various notifications for students
INSERT INTO Notifications (sender_id, recipient_id, student_id, title, message, date_sent, type, is_read) VALUES
-- From Admin (sender_id 1)
(1, 1, 1, 'Fee Reminder', 'Your semester fee payment is due by December 31, 2025. Please clear your dues.', '2025-12-01 09:00:00', 'fee', FALSE),
(1, 1, 1, 'Course Registration', 'Spring 2026 course registration is now open. Register before December 20.', '2025-11-28 10:00:00', 'academic', TRUE),
(1, 2, 2, 'Result Published', 'Your mid-semester results have been published. Check your dashboard.', '2025-11-25 14:30:00', 'academic', TRUE),
(1, 3, 3, 'Fee Reminder', 'Partial fee payment received. Remaining balance: PKR 25,000', '2025-11-20 11:00:00', 'fee', FALSE),
(1, 4, 4, 'Profile Verified', 'Your profile has been verified by the administration.', '2025-11-15 09:30:00', 'system', TRUE),
(1, 5, 5, 'Document Submission', 'Please submit your pending documents to the admin office.', '2025-12-03 10:00:00', 'system', FALSE),
(1, 6, 6, 'Fee Reminder', 'Your semester fee payment deadline is approaching.', '2025-12-01 09:00:00', 'fee', FALSE),
(1, 7, 7, 'Welcome Message', 'Welcome to EDU Track! Complete your profile for better experience.', '2025-11-10 08:00:00', 'system', TRUE),

-- From Faculty (sender_id 1 = Dr. Imran Sheikh)
(1, 1, 1, 'Assignment Due', 'Database Systems assignment is due on December 10, 2025.', '2025-12-04 15:00:00', 'assignment', FALSE),
(1, 2, 2, 'Quiz Announcement', 'Quiz on Algorithms will be held on December 8, 2025.', '2025-12-03 16:00:00', 'quiz', FALSE),
(1, 12, 12, 'Extra Class', 'Extra class for Advanced Algorithms on Saturday at 10 AM.', '2025-12-02 17:00:00', 'class', TRUE),

-- From Faculty (sender_id 2 = Dr. Nadia Khan)
(2, 1, 1, 'Project Submission', 'Web Development project final submission is on December 15.', '2025-12-01 14:00:00', 'project', FALSE),
(2, 2, 2, 'Lab Session', 'Database lab session rescheduled to Thursday.', '2025-11-27 12:00:00', 'class', TRUE),
(2, 6, 6, 'Attendance Warning', 'Your attendance is below 75%. Please attend regularly.', '2025-11-26 11:00:00', 'attendance', TRUE),

-- General announcements
(1, 8, 8, 'Holiday Notice', 'University will be closed on December 25 for Christmas.', '2025-12-05 09:00:00', 'announcement', FALSE),
(1, 9, 9, 'Scholarship', 'Merit scholarships applications are now open. Apply before Dec 20.', '2025-12-04 10:00:00', 'scholarship', FALSE),
(1, 10, 10, 'Exam Schedule', 'Final exam schedule will be released on December 10.', '2025-12-03 11:00:00', 'exam', FALSE);

-- ----------------------------
-- FEEDBACK DATA
-- ----------------------------
-- Student feedback for courses and faculty
INSERT INTO Feedback (student_id, faculty_id, course_id, message, date_submitted) VALUES
(1, 1, 2, 'Excellent teaching methodology. Concepts are explained very clearly.', '2025-11-20 10:30:00'),
(1, 2, 3, 'Great course! Lab sessions are very helpful for practical understanding.', '2025-11-21 14:00:00'),
(2, 1, 1, 'Very good teacher. Makes complex algorithms easy to understand.', '2025-11-22 09:15:00'),
(2, 1, 2, 'Could use more practice problems during class.', '2025-11-23 11:00:00'),
(3, 3, 11, 'Lab equipment needs upgrade. Otherwise teaching is good.', '2025-11-24 15:30:00'),
(4, 7, 7, 'Excellent course structure and project-based learning approach.', '2025-11-25 13:45:00'),
(4, 6, 10, 'Very practical course. Learned a lot about mobile development.', '2025-11-26 16:00:00'),
(8, 5, 14, 'Cloud computing concepts well explained with real-world examples.', '2025-11-27 10:00:00'),
(9, 7, 7, 'Great instructor. Project feedback is very detailed and helpful.', '2025-11-28 12:30:00'),
(12, 1, 2, 'One of the best courses. Challenging but very rewarding.', '2025-11-29 14:15:00'),
(12, 2, 3, 'Database course is well structured with good practical examples.', '2025-11-30 11:45:00'),
(12, 4, 5, 'Machine Learning course is intensive but incredibly valuable.', '2025-12-01 09:30:00');

-- ----------------------------
-- SALARY DATA
-- ----------------------------
-- Faculty salary records
INSERT INTO Salary (faculty_id, payment_date, status, amount) VALUES
-- November 2025 Salaries (Completed)
(1, '2025-11-25 10:00:00', 'completed', 150000.00),
(2, '2025-11-25 10:15:00', 'completed', 150000.00),
(3, '2025-11-25 10:30:00', 'completed', 145000.00),
(4, '2025-11-25 10:45:00', 'completed', 155000.00),
(5, '2025-11-25 11:00:00', 'completed', 140000.00),
(6, '2025-11-25 11:15:00', 'completed', 145000.00),
(7, '2025-11-25 11:30:00', 'completed', 160000.00),
(8, '2025-11-25 11:45:00', 'completed', 142000.00),

-- October 2025 Salaries (Completed)
(1, '2025-10-25 10:00:00', 'completed', 150000.00),
(2, '2025-10-25 10:15:00', 'completed', 150000.00),
(3, '2025-10-25 10:30:00', 'completed', 145000.00),
(4, '2025-10-25 10:45:00', 'completed', 155000.00),
(5, '2025-10-25 11:00:00', 'completed', 140000.00),
(6, '2025-10-25 11:15:00', 'completed', 145000.00),
(7, '2025-10-25 11:30:00', 'completed', 160000.00),
(8, '2025-10-25 11:45:00', 'completed', 142000.00),

-- December 2025 Salaries (Pending)
(1, NULL, 'pending', 150000.00),
(2, NULL, 'pending', 150000.00),
(3, NULL, 'pending', 145000.00),
(4, NULL, 'pending', 155000.00),
(5, NULL, 'pending', 140000.00),
(6, NULL, 'pending', 145000.00),
(7, NULL, 'pending', 160000.00),
(8, NULL, 'pending', 142000.00);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================================
-- VERIFICATION QUERIES
-- ===========================================================

-- Display summary statistics
SELECT 'Database Populated Successfully!' as Status;

SELECT 
    'Students' as Entity,
    COUNT(*) as Total,
    SUM(CASE WHEN profile_verified = TRUE THEN 1 ELSE 0 END) as Verified
FROM Student
UNION ALL
SELECT 
    'Faculty',
    COUNT(*),
    COUNT(*)
FROM Faculty
UNION ALL
SELECT 
    'Courses',
    COUNT(*),
    COUNT(*)
FROM Course
UNION ALL
SELECT 
    'Enrollments',
    COUNT(*),
    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END)
FROM Enrollment
UNION ALL
SELECT 
    'Attendance Records',
    COUNT(*),
    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END)
FROM Attendance
UNION ALL
SELECT 
    'Grades',
    COUNT(*),
    COUNT(*)
FROM Grades
UNION ALL
SELECT 
    'Fee Records',
    COUNT(*),
    SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END)
FROM Fee;

-- Display login credentials for testing
SELECT 
    '=== TEST LOGIN CREDENTIALS ===' as Info,
    '' as Username,
    '' as Password,
    '' as Role
UNION ALL
SELECT 
    'Admin Login',
    'admin@edu.com',
    'password123',
    'admin'
UNION ALL
SELECT 
    'Faculty Login',
    'imran@faculty.com',
    'password123',
    'faculty'
UNION ALL
SELECT 
    'Student Login (Asjal)',
    'asjal@student.com',
    'password123',
    'student'
UNION ALL
SELECT 
    'Student Login (Ali)',
    'ali@student.com',
    'password123',
    'student'
UNION ALL
SELECT 
    'Student Login (Waleed)',
    'waleed@student.com',
    'password123',
    'student';

