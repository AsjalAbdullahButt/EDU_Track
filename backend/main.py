from fastapi import FastAPI
#from database import Base, engine
# import routers.student as student_router
# import routers.faculty as faculty_router
# import routers.admin as admin_router
# import routers.course as course_router
# import routers.enrollment as enrollment_router
# import routers.attendence as attendance_router
# import routers.grades as grades_router
# import routers.fee as fee_router
# import routers.notifications as notifications_router
# import routers.feedback as feedback_router


# # Create all tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="EDU-Track API")


# Register all routers
# app.include_router(student_router.router)
# app.include_router(faculty_router.router)
# app.include_router(admin_router.router)
# app.include_router(course_router.router)
# app.include_router(enrollment_router.router)
# app.include_router(attendance_router.router)
# app.include_router(grades_router.router)
# app.include_router(fee_router.router)
# app.include_router(notifications_router.router)
# app.include_router(feedback_router.router)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv

# Import database helpers and SQLAlchemy Base/engine
from backend.database import engine, Base

# Import routers
from backend.routers import student as student_router
from backend.routers import faculty as faculty_router
from backend.routers import admin as admin_router
from backend.routers import course as course_router
from backend.routers import enrollment as enrollment_router
from backend.routers import attendence as attendance_router
from backend.routers import grades as grades_router
from backend.routers import fee as fee_router
from backend.routers import notifications as notifications_router
from backend.routers import feedback as feedback_router
from backend.routers import salaries as salaries_router
from backend.routers import auth as auth_router


app = FastAPI(title="EDU-Track API")

# Load backend/.env if present so DB settings are available
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables (if they don't exist)
Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def check_database_connection():
    try:
        # Try a short-lived connection to validate DB credentials and reachability
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        print("[startup] Database connection OK")
    except Exception as e:
        # Don't crash the server, but log a clear message for the developer
        print("[startup] WARNING: Could not connect to database:", e)

# Mount frontend static HTML/CSS/JS
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_HTML = os.path.join(BASE_DIR, "Front-End", "HTML")
FRONTEND_STATIC = os.path.join(BASE_DIR, "Front-End")

index_path = os.path.join(FRONTEND_HTML, 'index.html')
if os.path.isfile(index_path):
    @app.get("/")
    def serve_index():
        return FileResponse(index_path)

if os.path.isdir(FRONTEND_STATIC):
    # Serve all frontend assets (CSS/JS/Images) under /static
    app.mount("/static", StaticFiles(directory=FRONTEND_STATIC), name="static")

# Catch-all route to serve any other frontend file from Front-End directory.
# This runs after API routes, so APIs are matched first. It allows requests
# like `/pages/login.html` or `/CSS/main.css` to return files from the
# frontend directory without mounting at root which can block APIs.
@app.get("/{full_path:path}")
def serve_frontend_file(full_path: str):
    # Try to serve files from the HTML folder first (e.g. /pages/login.html -> Front-End/HTML/pages/login.html)
    candidate_html = os.path.join(FRONTEND_HTML, full_path)
    if os.path.isfile(candidate_html):
        return FileResponse(candidate_html)

    # Next try the general Front-End folder (useful for assets requested without /static/)
    candidate_static = os.path.join(FRONTEND_STATIC, full_path)
    if os.path.isfile(candidate_static):
        return FileResponse(candidate_static)

    # If not found, fallback to index (single page app fallback)
    if os.path.isfile(index_path):
        return FileResponse(index_path)

    # Not found
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Not Found")

# Register routers
app.include_router(student_router.router)
app.include_router(faculty_router.router)
app.include_router(admin_router.router)
app.include_router(course_router.router)
app.include_router(enrollment_router.router)
app.include_router(attendance_router.router)
app.include_router(grades_router.router)
app.include_router(fee_router.router)
app.include_router(notifications_router.router)
app.include_router(feedback_router.router)
app.include_router(salaries_router.router)
app.include_router(auth_router.router)