/* ============================================================
   EDU Track - Student Courses Page
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
      console.error('[courses] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadEnrolledCourses() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch enrollments and courses
  const [enrollmentsRes, coursesRes] = await Promise.all([
    fetchJson(`/enrollments`),
    fetchJson('/courses')
  ]);

  const enrollments = (enrollmentsRes || []).filter(e => e.student_id === studentId);
  const courses = coursesRes || [];

  // Map courses to enrollments
  const enrolledCourses = enrollments.map(e => {
    const course = courses.find(c => c.course_id === e.course_id);
    return { ...course, enrollment_id: e.enrollment_id, enrolled_date: e.enrolled_date };
  }).filter(c => c.course_id);

  // Render courses table
  const container = document.getElementById('enrolledCoursesContainer');
  if (!container) return;

  if (enrolledCourses.length === 0) {
    container.innerHTML = '<p class="empty-state">No courses enrolled. <a href="/pages/student_pages/add_courses.html">Browse courses</a></p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'courses-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Course Code</th>
        <th>Course Name</th>
        <th>Department</th>
        <th>Credits</th>
        <th>Instructor</th>
        <th>Enrolled Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${enrolledCourses.map(c => `
        <tr>
          <td>${c.course_code || 'N/A'}</td>
          <td>${c.course_name || 'N/A'}</td>
          <td>${c.department || 'N/A'}</td>
          <td>${c.credits || 'N/A'}</td>
          <td>${c.instructor_name || 'N/A'}</td>
          <td>${new Date(c.enrolled_date).toLocaleDateString()}</td>
          <td>
            <button class="btn-small btn-danger" onclick="dropCourse(${c.enrollment_id})">Drop</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

async function dropCourse(enrollmentId) {
  if (!confirm('Are you sure you want to drop this course?')) return;

  const result = await fetchJson(`/enrollments/${enrollmentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });

  if (result !== null || result === '') {
    if (window.showToast) window.showToast('Course dropped successfully', 'success');
    loadEnrolledCourses();
  }
}

// Auto-refresh every 30 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadEnrolledCourses();
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
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadEnrolledCourses();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
