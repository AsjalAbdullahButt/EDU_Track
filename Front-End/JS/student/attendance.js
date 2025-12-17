/* ============================================================
   EDU Track - Student Attendance Page
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
      console.error('[attendance] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadAttendance() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch only enrolled courses for this student
  const [coursesRes, attendanceRes] = await Promise.all([
    fetchJson(`/courses/student/${studentId}`),
    fetchJson(`/attendance/student/${studentId}`)
  ]);

  const courses = coursesRes || [];
  const attendance = attendanceRes || [];

  // Group by course and calculate stats
  const attendanceByClass = {};
  attendance.forEach(a => {
    if (!attendanceByClass[a.course_id]) {
      attendanceByClass[a.course_id] = { present: 0, absent: 0, total: 0 };
    }
    attendanceByClass[a.course_id].total++;
    if (a.status?.toLowerCase() === 'present') {
      attendanceByClass[a.course_id].present++;
    } else {
      attendanceByClass[a.course_id].absent++;
    }
  });

  // Render attendance grid
  const container = document.getElementById('attendanceGridContainer');
  if (!container) return;

  if (courses.length === 0) {
    container.innerHTML = '<p class="empty-state">No courses enrolled</p>';
    return;
  }

  container.innerHTML = `<div class="attendance-circles">
    ${courses.map(course => {
      const stats = attendanceByClass[course.course_id] || { present: 0, absent: 0, total: 0 };
      const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
      const circleColor = percentage >= 80 ? 'var(--pastel-mint)' : '#ff6b6b';
      const statusClass = percentage >= 80 ? 'status-good' : 'status-warning';
      const lowAttendanceClass = percentage < 80 ? 'low-attendance' : '';

      return `
        <div class="circle-card">
          <div class="circle-progress-container">
            <svg class="circular-progress" width="140" height="140" viewBox="0 0 140 140">
              <circle class="progress-bg" cx="70" cy="70" r="65" />
              <circle class="progress-fill ${lowAttendanceClass}" cx="70" cy="70" r="65" style="--percentage: ${percentage}" />
            </svg>
            <div class="circle-percentage" style="--color: ${circleColor}">${percentage}%</div>
          </div>
          <h3>${course.course_name}</h3>
          <div class="attendance-meta">
            <div class="meta-item">
              <span class="label">Present:</span>
              <span class="value text-success">${stats.present}</span>
            </div>
            <div class="meta-item">
              <span class="label">Absent:</span>
              <span class="value text-danger">${stats.absent}</span>
            </div>
            <div class="meta-item">
              <span class="label">Total:</span>
              <span class="value">${stats.total}</span>
            </div>
          </div>
          <a href="/pages/student_pages/attendance_detail.html?course_id=${course.course_id}" class="btn-view-details">View Details</a>
        </div>
      `;
    }).join('')}
  </div>`;
}

// Auto-refresh every 30 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadAttendance();
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
  
  loadAttendance();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
