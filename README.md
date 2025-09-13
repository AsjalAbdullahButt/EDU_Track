# 📘 EDU Track – Academic Portal
# Your Academic Companion 

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
│
├── frontend/ # HTML, CSS, JS files
│ ├── index.html # Landing page
│ ├── student/ # Student portal pages
│ ├── faculty/ # Faculty portal pages
│ └── admin/ # Admin dashboard
│
├── backend/
│ ├── app.py # Python backend (Flask/Django)
│ ├── routes/ # API endpoints
│ ├── models/ # Database models
│ └── services/ # Business logic
│
├── database/
│ ├── schema.sql # MySQL schema
│ └── seed.sql # Sample data
│
├── docs/ # Documentation & proposal
│ └── EDU-Track-Proposal.pdf
│
└── README.md # Project overview

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

## 📌 Future Enhancements
- Mobile application (Android/iOS)  
- Integration with email/SMS for notifications  
- Role-based dashboards with analytics  
- Secure API authentication with JWT  

---

## 👨‍💻 Team Members
- Asjal Abdullah (22L-6273)  
- Hamdan Malik (22L-7773)  
- Muhammad Waleed (22L-7788)  
- Salman Saeed (22L-7789)  

---

## 📄 License
This project is created as part of an academic requirement at **National University of Computer and Emerging Sciences (FAST-NUCES), Lahore**.  


