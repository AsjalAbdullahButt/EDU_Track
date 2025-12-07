from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from sqlalchemy import text
import logging

from database import engine, Base
from routers import student as student_router
from routers import faculty as faculty_router
from routers import admin as admin_router
from routers import course as course_router
from routers import enrollment as enrollment_router
from routers import attendence as attendance_router
from routers import grades as grades_router
from routers import marks as marks_router
from routers import fee as fee_router
from routers import notifications as notifications_router
from routers import feedback as feedback_router
from routers import salaries as salaries_router
from routers import auth as auth_router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('edu_track.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        logger.info("EDU-Track API started successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        logger.warning("Server started but database is not accessible")
    
    yield
    
    # Shutdown (if needed in the future)
    logger.info("EDU-Track API shutting down")

app = FastAPI(title="EDU-Track API", version="1.0.0", lifespan=lifespan)

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Add GZip compression middleware for faster response times
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Validation failed"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "message": str(exc)}
    )


Base.metadata.create_all(bind=engine)


# Register routers (ensure API routes are registered before the frontend catch-all)
app.include_router(student_router.router)
app.include_router(faculty_router.router)
app.include_router(admin_router.router)
app.include_router(course_router.router)
app.include_router(enrollment_router.router)
app.include_router(attendance_router.router)
app.include_router(grades_router.router)
app.include_router(marks_router.router)
app.include_router(fee_router.router)
app.include_router(notifications_router.router)
app.include_router(feedback_router.router)
app.include_router(salaries_router.router)
app.include_router(auth_router.router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


@app.get("/api/version")
def get_version():
    """Get API version"""
    return {
        "application": "EDU-Track",
        "version": "1.0.0",
        "api_version": "v1"
    }


# Mount frontend static HTML/CSS/JS
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_HTML = os.path.join(BASE_DIR, "Front-End", "HTML", "pages")
FRONTEND_STATIC = os.path.join(BASE_DIR, "Front-End")

index_path = os.path.join(BASE_DIR, "Front-End", "HTML", 'index.html')
if os.path.isfile(index_path):
    @app.get("/")
    def serve_index():
        return FileResponse(index_path)

if os.path.isdir(FRONTEND_STATIC):
    # Serve all frontend assets (CSS/JS/Images) under /static
    app.mount("/static", StaticFiles(directory=FRONTEND_STATIC), name="static")

# Serve a favicon at the root so browsers show the EDU logo in the tab
@app.get('/favicon.ico')
def favicon():
    fav_path = os.path.join(FRONTEND_STATIC, 'Images', 'EDU-Logo.png')
    if os.path.isfile(fav_path):
        return FileResponse(fav_path)
    # fallback to index if not found
    return FileResponse(index_path) 

# Serve HTML files from pages directory
# Only match paths that explicitly look like HTML files or page paths
@app.get("/pages/{full_path:path}")
async def serve_page_file(full_path: str):
    from fastapi import HTTPException
    
    candidate_html = os.path.join(FRONTEND_HTML, full_path)
    
    logger.info(f"Attempting to serve page: {full_path} -> {candidate_html}")
    
    if os.path.isfile(candidate_html):
        return FileResponse(candidate_html)
    
    # Try adding .html extension
    if not full_path.endswith('.html'):
        candidate_html_with_ext = candidate_html + '.html'
        if os.path.isfile(candidate_html_with_ext):
            return FileResponse(candidate_html_with_ext)
    
    raise HTTPException(status_code=404, detail=f"Page not found: {full_path}")
