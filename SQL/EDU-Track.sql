-- ===========================================================
-- DATABASE CREATION
-- ===========================================================
CREATE DATABASE IF NOT EXISTS EDU_Track;
USE EDU_Track;

-- ===========================================================
-- TABLE STRUCTURE
-- ===========================================================

-- ----------------------------
-- STUDENT TABLE
-- ----------------------------
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
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_department (department)
);

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
    INDEX idx_email (email),
    INDEX idx_role (role)
);

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
    INDEX idx_faculty_id (faculty_id)
);

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
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status)
);

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
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_date (date)
);

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
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_semester (semester)
);

-- ----------------------------
-- FEE TABLE
-- ----------------------------
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
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_student_id (student_id),
    INDEX idx_date_sent (date_sent)
);

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
    INDEX idx_student_id (student_id),
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_course_id (course_id)
);

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
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
);

-- ===========================================================
-- INSERT SAMPLE DATA (COMBINED FROM BOTH FILES)
-- ===========================================================

-- ADMIN
INSERT INTO Admin (name, email, password) VALUES 
('Super Admin', 'admin@edu.com', 'admin123'),
('System Admin', 'sysadmin@edu.com', 'admin123');

-- FACULTY (NO DUPLICATES)
INSERT INTO Faculty (faculty_id, name, email, password, department, contact, role) VALUES
(1, 'Dr. Imran Sheikh', 'imran@faculty.com', 'facpass123', 'Computer Science', '03112223344', 'faculty'),
(2, 'Dr. Nadia Khan', 'nadia@faculty.com', 'facpass123', 'Electrical', '03113334455', 'faculty'),
(3, 'Dr. Saeed Rizvi', 'saeed@faculty.com', 'facpass123', 'Mechanical', '03114445566', 'faculty'),
(4, 'Dr. Ahmed Hassan', 'ahmed@uni.com', 'password123', 'Computer Science', '03001234567', 'faculty'),
(5, 'Prof. Maria Khan', 'maria@uni.com', 'password123', 'Computer Science', '03009876543', 'faculty'),
(6, 'Dr. Ali Raza', 'ali@uni.com', 'password123', 'Information Technology', '03005555555', 'faculty'),
(7, 'Prof. Fatima Malik', 'fatima@uni.com', 'password123', 'Software Engineering', '03004444444', 'faculty');

-- STUDENTS (NO DUPLICATE EMAILS)
INSERT INTO Student (student_id, full_name, email, password, gender, dob, department, semester, contact, address, role, profile_verified, verification_status) VALUES
(1, 'Asjal Abdullah', 'asjal@student.com', 'password123', 'Female', '2002-05-12', 'Computer Science', 6, '03001234567', 'Street 1, City', 'student', 1, 'verified'),
(2, 'Ali Raza Khan', 'ali@student.com', 'password123', 'Male', '2001-11-03', 'Computer Science', 6, '03007654321', 'Street 2, City', 'student', 1, 'verified'),
(3, 'Sara Ahmed', 'sara@student.com', 'password123', 'Female', '2003-02-17', 'Electrical', 4, '03009871234', 'Street 3, City', 'student', 0, 'unverified');

-- Add remaining NEW students from file 2 with new IDs
INSERT INTO Student (student_id, full_name, email, password, gender, dob, department, semester, contact, address) VALUES
(12, 'Hira Ahmed', 'hira@student.com', 'pass123', 'Female', '2003-12-10', 'Software Engineering', 4, '03105555555', 'Islamabad, Pakistan'),
(13, 'Hassan Malik', 'hassan@student.com', 'pass123', 'Male', '2005-03-25', 'Information Technology', 2, '03104444444', 'Rawalpindi, Pakistan'),
(14, 'Sara Ali', 'sara2@student.com', 'pass123', 'Female', '2003-07-30', 'Computer Science', 5, '03103333333', 'Peshawar, Pakistan');

-- COURSES (UNIFIED LIST)
INSERT INTO Course (course_id, course_name, course_code, credit_hours, faculty_id) VALUES
(1, 'Data Structures', 'CS201', 3, 1),
(2, 'Algorithms', 'CS301', 3, 1),
(3, 'Circuit Analysis', 'EE101', 3, 2),
(4, 'Thermodynamics', 'ME201', 3, 3),
(5, 'Database Systems', 'CS401', 3, 1),
(6, 'Web Development', 'CS-203', 3, 2),
(7, 'Machine Learning', 'CS-301', 4, 2),
(8, 'Software Engineering', 'SE-301', 3, 7);

-- ENROLLMENTS (BOTH FILES MERGED—NO DUPLICATES)
INSERT INTO Enrollment (enrollment_id, student_id, course_id, semester, status) VALUES
(1, 1, 1, 6, 'Active'),
(2, 1, 5, 6, 'Active'),
(3, 2, 1, 6, 'Active'),
(4, 2, 2, 6, 'Active'),
(5, 3, 3, 4, 'Active');

-- Additional enrollments (file 2)
INSERT INTO Enrollment (student_id, course_id, semester, status) VALUES
(1, 6, 5, 'Active'),
(2, 3, 3, 'Active'),
(12, 8, 4, 'Active');

-- FEES
INSERT INTO Fee (fee_id, student_id, total_amount, amount_paid, due_date, status) VALUES
(1, 1, 1000.00, 500.00, '2025-12-31', 'Pending'),
(2, 2, 1000.00, 1000.00, '2025-10-31', 'Paid'),
(3, 3, 800.00, 0.00, '2025-11-15', 'Pending');

-- Additional fee data
INSERT INTO Fee (student_id, total_amount, amount_paid, due_date, status) VALUES
(12, 50000.00, 50000.00, '2025-12-31', 'Paid');

-- FEEDBACK
INSERT INTO Feedback (feedback_id, student_id, faculty_id, course_id, message, date_submitted) VALUES
(1, 1, 1, 1, 'Great lectures, well structured.', '2025-11-10 10:00:00'),
(2, 2, 1, 2, 'Could use more examples', '2025-11-12 12:30:00'),
(3, 3, 2, 3, 'Lab sessions were helpful.', '2025-11-15 09:20:00');

-- Additional feedback
INSERT INTO Feedback (student_id, faculty_id, course_id, message, date_submitted) VALUES
(12, 1, 1, 'Excellent teaching.', '2025-11-15');

-- SALARY
INSERT INTO Salary (faculty_id, payment_date, status, amount) VALUES
(1, '2025-11-25 10:00:00', 'completed', 150000.00),
(2, '2025-11-25 10:30:00', 'completed', 150000.00);

SELECT * from Student

