/* ============================================================
   EDU Track - Admin Reports Page
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
      console.error('[admin_reports] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadAdminReports() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (session.role !== 'admin') {
    if (window.showToast) window.showToast('Access denied', 'error');
    return;
  }

  // Fetch statistics
  const [studentsRes, facultyRes, coursesRes, enrollmentsRes] = await Promise.all([
    fetchJson('/students'),
    fetchJson('/faculties'),
    fetchJson('/courses'),
    fetchJson('/enrollments')
  ]);

  const students = studentsRes || [];
  const faculty = facultyRes || [];
  const courses = coursesRes || [];
  const enrollments = enrollmentsRes || [];

  // Calculate stats
  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;
  const avgEnrollmentsPerCourse = courses.length > 0 ? Math.round(enrollments.length / courses.length) : 0;

  // Update dashboard
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('totalFaculty').textContent = totalFaculty;
  document.getElementById('totalCourses').textContent = totalCourses;
  document.getElementById('totalEnrollments').textContent = totalEnrollments;
  document.getElementById('avgEnrollments').textContent = avgEnrollmentsPerCourse;

  // Render charts/tables if containers exist
  renderDepartmentStats(courses);
  renderEnrollmentTrends(enrollments);
}

function renderDepartmentStats(courses) {
  const byDept = {};
  courses.forEach(c => {
    const dept = c.department || 'Other';
    byDept[dept] = (byDept[dept] || 0) + 1;
  });

  const container = document.getElementById('departmentStatsContainer');
  if (container) {
    container.innerHTML = Object.entries(byDept).map(([dept, count]) => `
      <div class="stat-row">
        <strong>${dept}</strong>
        <span>${count} courses</span>
      </div>
    `).join('');
  }
}

function renderEnrollmentTrends(enrollments) {
  const container = document.getElementById('enrollmentTrendsContainer');
  if (container && enrollments.length > 0) {
    container.innerHTML = `<p>Total enrollments: ${enrollments.length}</p>`;
  }
}

// Auto-refresh every 60 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadAdminReports();
  }, 60000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('admin');
  } catch (e) { }
  
  loadAdminReports();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
