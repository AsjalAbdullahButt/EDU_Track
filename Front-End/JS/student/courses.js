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

  // Clear the container first
  container.innerHTML = '';

  if (enrolledCourses.length === 0) {
    container.innerHTML = '<p class="empty-state">No courses enrolled. <a href="/pages/student_pages/add_courses.html">Browse courses</a></p>';
    return;
  }

  // helper to format dates safely
  function formatSafeDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
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
          <td>${formatSafeDate(c.enrolled_date)}</td>
          <td>
            <button class="btn-small btn-danger" onclick="dropCourse(${c.enrollment_id})">
              <span class="btn-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 6h18v2H3V6zm2 3h14l-1.1 11.1A2 2 0 0 1 15.9 22H8.1a2 2 0 0 1-1.99-1.9L5 9zm6-6c.55 0 1 .45 1 1h4v2H5V4h4c0-.55.45-1 1-1z"/>
                </svg>
              </span>
              <span>Drop</span>
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  container.appendChild(table);
  
  // Add "Add New Course" button below the table
  const addButton = document.createElement('button');
  addButton.className = 'btn primary';
  addButton.textContent = '+ Add New Course';
  addButton.style.marginTop = '20px';
  addButton.onclick = () => {
    window.location.href = '/pages/student_pages/add_courses.html';
  };
  container.appendChild(addButton);
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
