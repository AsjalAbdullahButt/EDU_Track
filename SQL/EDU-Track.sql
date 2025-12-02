-- EDU-Track seed data for testing
-- Insert students
INSERT INTO Student (student_id, full_name, email, password, gender, dob, department, semester, contact, address, role, profile_verified, verification_status) VALUES
(1, 'Asjal Abdullah', 'asjal@student.com', 'password123', 'Female', '2002-05-12', 'Computer Science', 6, '03001234567', 'Street 1, City', 'student', 1, 'verified'),
(2, 'Ali Raza Khan', 'ali@student.com', 'password123', 'Male', '2001-11-03', 'Computer Science', 6, '03007654321', 'Street 2, City', 'student', 1, 'verified'),
(3, 'Sara Ahmed', 'sara@student.com', 'password123', 'Female', '2003-02-17', 'Electrical', 4, '03009871234', 'Street 3, City', 'student', 0, 'unverified'),
(4, 'Bilal Hussain', 'bilal@student.com', 'password123', 'Male', '2002-08-21', 'Mechanical', 5, '03005551234', 'Street 4, City', 'student', 0, 'unverified'),
(5, 'Hina Khan', 'hina@student.com', 'password123', 'Female', '2001-12-09', 'Computer Science', 8, '03002223344', 'Street 5, City', 'student', 1, 'verified'),
(6, 'Usman Iqbal', 'usman@student.com', 'password123', 'Male', '2003-01-30', 'Civil', 3, '03004445566', 'Street 6, City', 'student', 0, 'unverified'),
(7, 'Mariam Ali', 'mariam@student.com', 'password123', 'Female', '2002-07-04', 'Computer Science', 6, '03007778899', 'Street 7, City', 'student', 1, 'verified'),
(8, 'Omar Siddiqui', 'omar@student.com', 'password123', 'Male', '2003-03-11', 'Electrical', 4, '03009990011', 'Street 8, City', 'student', 0, 'unverified'),
(9, 'Zainab Noor', 'zainab@student.com', 'password123', 'Female', '2001-06-18', 'Computer Science', 8, '03001112233', 'Street 9, City', 'student', 1, 'verified'),
(10, 'Faraz Khan', 'faraz@student.com', 'password123', 'Male', '2002-04-25', 'Mechanical', 5, '03003334455', 'Street 10, City', 'student', 0, 'unverified'),
(11, 'Ayesha Malik', 'ayesha@student.com', 'password123', 'Female', '2003-09-08', 'Computer Science', 2, '03001239876', 'Street 11, City', 'student', 0, 'unverified');

-- Insert faculties
INSERT INTO Faculty (faculty_id, name, email, password, department, contact, role) VALUES
(1, 'Dr. Imran Sheikh', 'imran@faculty.com', 'facpass123', 'Computer Science', '03112223344', 'faculty'),
(2, 'Dr. Nadia Khan', 'nadia@faculty.com', 'facpass123', 'Electrical', '03113334455', 'faculty'),
(3, 'Dr. Saeed Rizvi', 'saeed@faculty.com', 'facpass123', 'Mechanical', '03114445566', 'faculty');

-- Insert courses
INSERT INTO Course (course_id, course_name, course_code, credit_hours, faculty_id) VALUES
(1, 'Data Structures', 'CS201', 3, 1),
(2, 'Algorithms', 'CS301', 3, 1),
(3, 'Circuit Analysis', 'EE101', 3, 2),
(4, 'Thermodynamics', 'ME201', 3, 3),
(5, 'Database Systems', 'CS401', 3, 1);

-- Insert enrollments (link students to courses)
INSERT INTO Enrollment (enrollment_id, student_id, course_id, semester, status) VALUES
(1, 1, 1, 6, 'Active'),
(2, 1, 5, 6, 'Active'),
(3, 2, 1, 6, 'Active'),
(4, 2, 2, 6, 'Active'),
(5, 3, 3, 4, 'Active'),
(6, 4, 4, 5, 'Active'),
(7, 5, 1, 8, 'Active'),
(8, 6, 3, 3, 'Active'),
(9, 7, 2, 6, 'Active'),
(10, 8, 3, 4, 'Active'),
(11, 9, 5, 8, 'Active');

-- Insert fees
INSERT INTO Fee (fee_id, student_id, total_amount, amount_paid, due_date, status) VALUES
(1, 1, 1000.00, 500.00, '2025-12-31', 'Pending'),
(2, 2, 1000.00, 1000.00, '2025-10-31', 'Paid'),
(3, 3, 800.00, 0.00, '2025-11-15', 'Pending');

-- Insert feedback
INSERT INTO Feedback (feedback_id, student_id, faculty_id, course_id, message, date_submitted) VALUES
(1, 1, 1, 1, 'Great lectures, well structured.', '2025-11-10 10:00:00'),
(2, 2, 1, 2, 'Could use more examples on dynamic programming.', '2025-11-12 12:30:00'),
(3, 3, 2, 3, 'Lab sessions were very helpful.', '2025-11-15 09:20:00');

-- Notes: run these INSERTs after the database schema has been created by the application (SQLAlchemy). If you re-run the same INSERTs on an existing DB, you may need to clear tables first or use INSERT ... ON DUPLICATE KEY UPDATE style statements.
