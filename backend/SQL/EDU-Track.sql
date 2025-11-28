CREATE DATABASE IF NOT EXISTS EDU_Track;
USE EDU_Track;

-- -------------------------------------------------------------------
-- STUDENT TABLE
-- -------------------------------------------------------------------
CREATE TABLE Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
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
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department),
    INDEX idx_semester (semester)
);

-- -------------------------------------------------------------------
-- FACULTY TABLE
-- -------------------------------------------------------------------
CREATE TABLE Faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    contact VARCHAR(20),
    role VARCHAR(20) DEFAULT 'faculty',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department)
);

-- -------------------------------------------------------------------
-- ADMIN TABLE
-- -------------------------------------------------------------------
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- -------------------------------------------------------------------
-- COURSE TABLE
-- -------------------------------------------------------------------
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
    INDEX idx_faculty_id (faculty_id)
);

-- -------------------------------------------------------------------
-- ENROLLMENT TABLE
-- -------------------------------------------------------------------
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
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status)
);

-- -------------------------------------------------------------------
-- ATTENDANCE TABLE
-- -------------------------------------------------------------------
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
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_date (date)
);

-- -------------------------------------------------------------------
-- GRADES TABLE
-- -------------------------------------------------------------------
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
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_semester (semester)
);

-- -------------------------------------------------------------------
-- FEE TABLE
-- -------------------------------------------------------------------
CREATE TABLE Fee (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- -------------------------------------------------------------------
-- NOTIFICATIONS TABLE
-- -------------------------------------------------------------------
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    recipient_id INT,
    message VARCHAR(255) NOT NULL,
    date_sent DATETIME DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_date_sent (date_sent)
);

-- -------------------------------------------------------------------
-- FEEDBACK TABLE
-- -------------------------------------------------------------------
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
    INDEX idx_student_id (student_id),
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_course_id (course_id)
);

-- -------------------------------------------------------------------
-- SALARY TABLE (Faculty Salaries)
-- -------------------------------------------------------------------
CREATE TABLE Salary (
    salary_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    payment_date DATETIME,
    status VARCHAR(20) DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
);

-- ===================================================================
-- SAMPLE DATA
-- ===================================================================

-- Admin Users
INSERT INTO Admin (name, email, password) VALUES 
('Super Admin', 'admin@edu.com', 'admin123'),
('System Admin', 'sysadmin@edu.com', 'admin123');

-- Faculty Members
INSERT INTO Faculty (name, email, password, department, contact) VALUES 
('Dr. Ahmed Hassan', 'ahmed@uni.com', 'password123', 'Computer Science', '03001234567'),
('Prof. Maria Khan', 'maria@uni.com', 'password123', 'Computer Science', '03009876543'),
('Dr. Ali Raza', 'ali@uni.com', 'password123', 'Information Technology', '03005555555'),
('Prof. Fatima Malik', 'fatima@uni.com', 'password123', 'Software Engineering', '03004444444');

-- Students
INSERT INTO Student (full_name, email, password, gender, department, semester, contact, address, dob) VALUES 
('Asjal Abdullah', 'asjal@student.com', 'pass123', 'Male', 'Computer Science', 5, '03101234567', 'Karachi, Pakistan', '2003-05-15'),
('Ali Raza Khan', 'ali@student.com', 'pass123', 'Male', 'Computer Science', 3, '03109876543', 'Lahore, Pakistan', '2004-08-20'),
('Hira Ahmed', 'hira@student.com', 'pass123', 'Female', 'Software Engineering', 4, '03105555555', 'Islamabad, Pakistan', '2003-12-10'),
('Hassan Malik', 'hassan@student.com', 'pass123', 'Male', 'Information Technology', 2, '03104444444', 'Rawalpindi, Pakistan', '2005-03-25'),
('Sara Ali', 'sara@student.com', 'pass123', 'Female', 'Computer Science', 5, '03103333333', 'Peshawar, Pakistan', '2003-07-30');

-- Courses
INSERT INTO Course (course_name, course_code, credit_hours, faculty_id) VALUES 
('Data Structures', 'CS-201', 3, 1),
('Database Systems', 'CS-202', 3, 1),
('Web Development', 'CS-203', 3, 2),
('Machine Learning', 'CS-301', 4, 2),
('Software Engineering', 'SE-301', 3, 4),
('Network Security', 'IT-302', 3, 3);

-- Enrollments
INSERT INTO Enrollment (student_id, course_id, semester, status) VALUES 
(1, 1, 5, 'Active'),
(1, 2, 5, 'Active'),
(1, 4, 5, 'Active'),
(2, 1, 3, 'Active'),
(2, 3, 3, 'Active'),
(3, 5, 4, 'Active'),
(3, 2, 4, 'Active'),
(4, 6, 2, 'Active'),
(5, 1, 5, 'Active'),
(5, 4, 5, 'Completed');

-- Attendance Records
INSERT INTO Attendance (student_id, course_id, date, status) VALUES 
(1, 1, '2025-11-20', 'Present'),
(1, 1, '2025-11-21', 'Present'),
(1, 1, '2025-11-22', 'Absent'),
(1, 2, '2025-11-20', 'Present'),
(1, 2, '2025-11-21', 'Present'),
(2, 1, '2025-11-20', 'Present'),
(2, 1, '2025-11-21', 'Absent'),
(2, 3, '2025-11-20', 'Present'),
(3, 5, '2025-11-20', 'Present'),
(3, 2, '2025-11-21', 'Present');

-- Grades
INSERT INTO Grades (student_id, course_id, marks_obtained, grade, semester) VALUES 
(1, 1, 85.50, 'A', 5),
(1, 2, 92.00, 'A+', 5),
(1, 4, 78.00, 'B+', 5),
(2, 1, 88.00, 'A', 3),
(2, 3, 75.50, 'B', 3),
(3, 5, 90.00, 'A+', 4),
(3, 2, 82.00, 'A', 4),
(4, 6, 70.00, 'B', 2),
(5, 1, 95.00, 'A+', 5);

-- Fees
INSERT INTO Fee (student_id, total_amount, amount_paid, due_date, status) VALUES 
(1, 50000.00, 50000.00, '2025-12-31', 'Paid'),
(2, 50000.00, 25000.00, '2025-12-31', 'Partial'),
(3, 50000.00, 0.00, '2025-12-31', 'Pending'),
(4, 50000.00, 50000.00, '2025-12-31', 'Paid'),
(5, 50000.00, 35000.00, '2025-12-31', 'Partial');

-- Notifications
INSERT INTO Notifications (sender_id, recipient_id, message, type, is_read) VALUES 
(1, 1, 'Your grades for CS-201 have been posted', 'grade', FALSE),
(2, 2, 'Attendance alert: You are below 75%', 'attendance', TRUE),
(1, 3, 'Fee payment reminder: Due on 2025-12-31', 'fee', FALSE),
(3, 4, 'New course assignment available', 'assignment', FALSE);

-- Feedback
INSERT INTO Feedback (student_id, faculty_id, course_id, message, date_submitted) VALUES 
(1, 1, 1, 'Great course! Very informative lectures.', '2025-11-15'),
(2, 1, 1, 'Could improve the practical assignments.', '2025-11-16'),
(3, 4, 5, 'Excellent teaching methodology.', '2025-11-14'),
(4, 3, 6, 'Please provide more resources for study.', '2025-11-10');

-- Salary Records
INSERT INTO Salary (faculty_id, payment_date, status, amount) VALUES 
(1, '2025-11-25 10:00:00', 'completed', 150000.00),
(2, '2025-11-25 10:30:00', 'completed', 150000.00),
(3, '2025-11-25 11:00:00', 'pending', 140000.00),
(4, '2025-11-25 11:30:00', 'pending', 145000.00);

-- ===================================================================
-- UTILITY QUERIES
-- ===================================================================

-- Calculate Attendance Percentage for a Student
SELECT 
    s.student_id,
    s.full_name,
    c.course_code,
    ROUND(
        (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
        2) AS attendance_percentage
FROM Student s
JOIN Attendance a ON s.student_id = a.student_id
JOIN Course c ON a.course_id = c.course_id
GROUP BY s.student_id, c.course_id;

-- Get Student Dashboard Summary
SELECT 
    s.student_id,
    s.full_name,
    COUNT(DISTINCT e.course_id) AS enrolled_courses,
    AVG(g.marks_obtained) AS avg_marks,
    f.status AS fee_status,
    f.amount_paid,
    f.total_amount
FROM Student s
LEFT JOIN Enrollment e ON s.student_id = e.student_id
LEFT JOIN Grades g ON s.student_id = g.student_id
LEFT JOIN Fee f ON s.student_id = f.student_id
WHERE s.student_id = 1
GROUP BY s.student_id;




