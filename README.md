# 📘 EDU Track – Academic Portal
### Your Academic Companion

EDU Track is a university-level academic management portal designed to provide students, faculty, and administrators with a **centralized platform** to handle all essential academic activities.  
The system streamlines attendance tracking, course registration, fee management, grading, notifications, and feedback into one unified portal.

---

## 🚀 Features
- **Student Module**
  - Registration & secure login (with password hashing)
  - Profile management with admin verification
  - Real-time attendance tracking with percentage calculation
  - Course enrollment & management
  - Fee payment tracking & receipt generation
  - Detailed results (quiz, mid, assignment, final marks)
  - Real-time notifications
  - Course feedback submission  

- **Faculty Module**
  - Secure login & dashboard with statistics
  - Attendance management for courses
  - Grade submissions (quiz, mid, assignment, final)
  - Course management
  - Student feedback review
  - Salary tracking  

- **Administration Module**
  - Dashboard with real-time statistics
  - Student profile verification
  - Fee verification & monitoring
  - User management (students, faculty, admins)
  - Course approval system
  - Notification management  

---

## 🏗️ Project Structure

```
EDU_Track/
│
├── Front-End/               # Frontend Module
│   ├── HTML/                # HTML pages
│   │   ├── index.html       # Landing page
│   │   ├── pages/           # Student/Faculty/Admin pages
│   │   └── components/      # Reusable components
│   ├── CSS/                 # Stylesheets
│   ├── JS/                  # JavaScript files
│   │   ├── auth.js          # Authentication logic
│   │   ├── dashboard.js     # Dashboard utilities
│   │   ├── student/         # Student-specific scripts
│   │   ├── faculty/         # Faculty-specific scripts
│   │   └── admin/           # Admin-specific scripts
│   └── Images/              # Static assets
│
├── backend/                 # Backend Module (FastAPI)
│   ├── main.py              # Main application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── security.py          # Password hashing utilities
│   ├── routers/             # API route handlers
│   │   ├── auth.py          # Authentication
│   │   ├── student.py       # Student endpoints
│   │   ├── faculty.py       # Faculty endpoints
│   │   ├── admin.py         # Admin endpoints
│   │   ├── course.py        # Course management
│   │   ├── enrollment.py    # Course enrollments
│   │   ├── attendence.py    # Attendance tracking
│   │   ├── grades.py        # Grades management
│   │   ├── fee.py           # Fee management
│   │   ├── notifications.py # Notifications
│   │   ├── feedback.py      # Feedback system
│   │   └── salaries.py      # Faculty salaries
│   └── crud/                # Database operations
│
├── SQL/                     # Database Scripts
│   └── EDU-Track.sql        # Database schema & seed data
│
├── docs/                    # Documentation
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
```

---

## ⚙️ Tools & Technologies
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)  
- **Backend:** Python 3.10+, FastAPI  
- **Database:** MySQL 8.0+  
- **ORM:** SQLAlchemy  
- **Security:** Passlib (bcrypt password hashing)
- **IDE/Editor:** VS Code  
- **Database Tools:** MySQL Workbench
- **Version Control:** Git & GitHub  

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.10 or higher
- MySQL 8.0 or higher
- pip (Python package manager)

### Step 1: Clone the Repository
```bash
git clone https://github.com/AsjalAbdullahButt/EDU_Track.git
cd EDU_Track
```

### Step 2: Set Up Database
1. Open MySQL and create the database:
   ```sql
   CREATE DATABASE EDU_Track;
   ```
2. Import the schema:
   ```bash
   mysql -u root -p EDU_Track < SQL/EDU-Track.sql
   ```

### Step 3: Configure Environment
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
3. Edit `.env` with your database credentials:
   ```
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=EDU_Track
   ```

### Step 4: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Run the Application
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The application will be available at:
- **Frontend:** http://localhost:8000/
- **API Documentation:** http://localhost:8000/docs
- **Alternative API Docs:** http://localhost:8000/redoc

---

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` → Login (supports email, contact, or name)

### Students
- `POST /students/` → Register new student
- `GET /students/` → List all students
- `GET /students/{id}` → Get student details
- `GET /students/{id}/dashboard/stats` → Student dashboard statistics
- `GET /courses/student/{id}` → Get student's enrolled courses
- `GET /grades/student/{id}` → Get student's grades
- `GET /attendance/student/{id}` → Get student's attendance
- `GET /fees/student/{id}` → Get student's fee records
- `GET /notifications/student/{id}` → Get student's notifications

### Faculty
- `POST /faculties/` → Create faculty account
- `GET /faculties/{id}/dashboard/stats` → Faculty dashboard statistics
- `GET /faculties/{id}/courses` → Get faculty's courses
- `GET /feedback/faculty/{id}` → Get faculty feedback
- `GET /salaries/faculty/{id}` → Get faculty salary records

### Admin
- `GET /admins/dashboard/stats` → Admin dashboard statistics
- `GET /admins/pending-profiles` → Get pending student profiles
- `POST /admins/verify-profile/{id}` → Verify student profile

### Courses
- `GET /courses/` → List all courses
- `POST /courses/` → Create new course

### Enrollments
- `POST /enrollments/` → Enroll student in course

### Grades
- `POST /grades/` → Submit grades
- `PUT /grades/{id}` → Update grades

### Attendance
- `POST /attendance/` → Mark attendance

### Fees
- `GET /fees/` → List all fees
- `PUT /fees/{id}` → Update fee status

### Notifications
- `POST /notifications/` → Create notification
- `POST /notifications/student/{id}/mark-read` → Mark notifications as read

---

## 🔒 Security Features
- **Password Hashing:** All passwords are hashed using bcrypt
- **Role-based Access Control:** Different access levels for students, faculty, and admins
- **Input Validation:** Pydantic schemas validate all API inputs
- **CORS Protection:** Configured for secure cross-origin requests
- **SQL Injection Prevention:** SQLAlchemy ORM prevents SQL injection

---


## 👨‍💻 Team Members
- Asjal Abdullah (22L-6273)  
- Hamdan Malik (22L-7773)  
- Muhammad Waleed (22L-7788)  
- Salman Saeed (22L-7789)  

---

## 📄 License
This project is created as part of an academic requirement at **National University of Computer and Emerging Sciences (FAST-NUCES), Lahore**.  

---

**Developer Setup**

- **Copy env template and fill credentials** (backend):

```powershell
cd .\backend
copy .env.template .env
# Edit backend\.env and set DB_USER, DB_PASSWORD, DB_HOST, DB_NAME
```

- **Create virtualenv and install dependencies**:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt
```

- **(Optional) Import DB schema** — this will run `SQL/EDU-Track.sql` against the configured database. It is interactive and will ask before overwriting existing tables:

```powershell
python ..\backend\sync_db.py
```

- **Run the API server**:

```powershell
cd ..\backend
.\.venv\Scripts\Activate
uvicorn backend.main:app --reload --port 8000
```

- **Run smoke tests** (verifies core endpoints):

```powershell
python ..\scripts\smoke_test.py http://localhost:8000
```

If you get database connection errors, check `backend/.env` values and ensure MySQL is running and reachable. The server prints a startup message indicating DB connectivity status.

---

**Developer Setup**

 - **1. Prepare environment file**: copy `backend/.env.template` to `backend/.env` and fill in your MySQL credentials.

 - **2. Install backend dependencies (recommended in a virtualenv)**:

   ```powershell
   cd backend
   python -m venv .venv; .\.venv\Scripts\Activate; pip install -r requirements.txt
   ```

 - **3. (Optional) Sync database schema**:

   ```powershell
   # from repository root
   python backend/sync_db.py
   ```

 - **4. Run the API server**:

   ```powershell
   # from repository root
   cd backend
   .\.venv\Scripts\Activate
   uvicorn backend.main:app --reload --port 8000
   ```

 - **5. Open the frontend**: in your browser go to `http://localhost:8000/` which serves the `Front-End` static files via the API server.



