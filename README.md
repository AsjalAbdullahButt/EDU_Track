# 📘 EDU Track – Academic Portal
### Your Academic Companion

EDU Track is a university-level academic management portal designed to provide students, faculty, and administrators with a **centralized platform** to handle all essential academic activities.  
The system aims to streamline attendance tracking, course registration, fee management, grading, notifications, and feedback into one unified portal.

---

## 🚀 Features
- **Student Module**
  - Registration & secure login
  - Profile management
  - Attendance tracking
  - Course registration & drop
  - Fee payments & receipt generation
  - Result checking & grading updates
  - Notifications & alerts
  - Feedback submission  

- **Faculty Module**
  - Attendance management
  - Grade submissions
  - Course updates
  - Review student feedback  

- **Administration Module**
  - Approve course registrations
  - Monitor fee transactions
  - Manage system security & user roles  

---

## 🏗️ Project Structure

```
EDU_Track/
│
├── frontend/                # **Frontend Module**
│   ├── index.html           # Landing page
│   ├── student/             # **Student Module Pages**
│   ├── faculty/             # **Faculty Module Pages**
│   └── admin/               # **Admin Module Pages**
│
├── backend/                 # **Backend Module**
│   ├── app.py               # Main backend application (Flask/Django)
│   ├── routes/              # **API Endpoints**
│   ├── models/              # **Database Models**
│   └── services/            # **Business Logic/Services**
│
├── database/                # **Database Scripts**
│   ├── schema.sql           # MySQL schema
│   └── seed.sql             # Sample data
│
├── docs/                    # **Documentation**
│   └── EDU-Track.pdf
│
└── README.md                # Project overview
```

---

## ⚙️ Tools & Technologies
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Python (Flask or Django)  
- **Database:** MySQL  
- **IDE/Editor:** VS Code  
- **Database Tools:** MySQL Workbench / SQL Server  
- **Version Control:** Git & GitHub  

---

## 🌐 API Design (Proposed)
The system will expose RESTful APIs to handle communication between the frontend and backend.

### Example Endpoints
- **Authentication**
  - `POST /api/register` → Register a new student
  - `POST /api/login` → Login and receive a session/token  

- **Student**
  - `GET /api/student/{id}/profile` → Fetch student profile  
  - `POST /api/student/{id}/register-course` → Register for a course  
  - `POST /api/student/{id}/drop-course` → Drop a course  
  - `GET /api/student/{id}/attendance` → View attendance  
  - `GET /api/student/{id}/results` → View results  

- **Faculty**
  - `POST /api/faculty/{id}/attendance` → Mark/update attendance  
  - `POST /api/faculty/{id}/grades` → Submit grades  

- **Admin**
  - `GET /api/admin/fees` → Monitor fee transactions  
  - `POST /api/admin/approve-course` → Approve course registration  

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



