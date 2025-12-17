/* ============================================================
   EDU Track - My Courses (Faculty)
   ============================================================ */

async function fetchJson(path, opts = {}) {
  try {
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates) {
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        console.debug('[fetchJson] candidate failed', url, e.message);
      }
    }
  } catch (e) {
    try {
      const base2 = 'http://127.0.0.1:8000';
      const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
      for (const p of candidates2) {
        const fallback = base2 + p;
        try {
          const res2 = await fetch(fallback, opts);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {
          console.debug('[fetchJson] fallback failed', fallback, e2.message);
        }
      }
    } catch (e2) {
      console.error('[my_courses] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadMyCourses() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch data
  const [coursesRes, enrollmentsRes] = await Promise.all([
    fetchJson(`/faculties/${facultyId}/courses`),
    fetchJson('/enrollments')
  ]);

  const courses = coursesRes || [];
  const allEnrollments = enrollmentsRes || [];

  // Calculate stats
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const totalEnrolled = allEnrollments.filter(e => 
    courses.some(c => c.course_id === e.course_id) && e.status === 'Active'
  ).length;

  // Update stats
  document.getElementById('totalCourses').textContent = courses.length;
  document.getElementById('totalCredits').textContent = totalCredits;
  document.getElementById('totalEnrolled').textContent = totalEnrolled;

  // Render courses
  renderCourses(courses, allEnrollments);
}

function renderCourses(courses, enrollments) {
  const container = document.getElementById('coursesContainer');
  
  if (!courses || courses.length === 0) {
    container.innerHTML = '<div class="empty-state">No courses assigned</div>';
    return;
  }

  container.innerHTML = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.course_id === course.course_id && e.status === 'Active');
    const studentCount = courseEnrollments.length;

    return `
      <div class="course-card-detail">
        <div class="course-header">
          <h3>${course.course_name}</h3>
          <span class="course-code">${course.course_code}</span>
        </div>
        <div class="course-info">
          <div class="info-row">
            <span class="label">Credits:</span>
            <span class="value">${course.credits || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Semester:</span>
            <span class="value">${course.semester || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Students Enrolled:</span>
            <span class="value highlight">${studentCount}</span>
          </div>
          <div class="info-row">
            <span class="label">Schedule:</span>
            <span class="value">${course.schedule || 'N/A'}</span>
          </div>
        </div>
        <div class="course-actions">
          <a href="/pages/dashboard/faculty/manage_attendance.html?course_id=${course.course_id}" class="btn-action">Attendance</a>
          <a href="/pages/dashboard/faculty/faculty_grades.html?course_id=${course.course_id}" class="btn-action">Grades</a>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  loadMyCourses();
});
