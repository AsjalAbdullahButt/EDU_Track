/* ============================================================
   EDU Track - Faculty Dashboard
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
      console.error('[dashboard_faculty] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadFacultyDashboard() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch courses, students, grades
  const [coursesRes, enrollmentsRes, gradesRes, attendanceRes] = await Promise.all([
    fetchJson('/courses'),
    fetchJson('/enrollments'),
    fetchJson('/grades'),
    fetchJson('/attendance')
  ]);

  const courses = (coursesRes || []).filter(c => c.faculty_id === facultyId);
  const enrollments = enrollmentsRes || [];
  const grades = gradesRes || [];
  const attendance = attendanceRes || [];

  // Calculate stats
  const totalCourses = courses.length;
  const totalStudents = enrollments.filter(e => {
    const course = courses.find(c => c.course_id === e.course_id);
    return course;
  }).length;
  const totalGrades = grades.filter(g => {
    const course = courses.find(c => c.course_id === g.course_id);
    return course;
  }).length;

  // Update dashboard
  document.getElementById('totalCourses').textContent = totalCourses;
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('totalGrades').textContent = totalGrades;

  // Render courses list
  const coursesContainer = document.getElementById('coursesListContainer');
  if (coursesContainer) {
    coursesContainer.innerHTML = courses.map(c => `
      <div class="course-card">
        <h3>${c.course_name}</h3>
        <p>${c.course_code} - ${c.credits} Credits</p>
        <div class="course-stats">
          <span>${enrollments.filter(e => e.course_id === c.course_id).length} Students</span>
          <a href="/pages/dashboard/faculty/manage_attendance.html?course_id=${c.course_id}" class="btn-small">Manage</a>
        </div>
      </div>
    `).join('');
  }
}

// Auto-refresh every 30 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadFacultyDashboard();
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  loadFacultyDashboard();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
