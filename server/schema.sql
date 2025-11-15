-- Step 1: Create the database
CREATE DATABASE edutrack;

-- Step 2: Select the database
USE edutrack;

-- Step 3: Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: Insert some sample data
INSERT INTO users (username, email, password, role) VALUES
('john_doe', 'john@example.com', 'password123', 'student'),
('jane_doe', 'jane@example.com', 'password456', 'teacher'),
('admin_user', 'admin@example.com', 'adminpassword', 'admin');
