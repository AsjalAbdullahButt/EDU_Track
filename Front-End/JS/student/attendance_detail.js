/* ============================================================
   EDU Track - Student Attendance Detail Page
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
      console.error('[attendance_detail] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadAttendanceDetail() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Get course_id from URL parameters
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course_id');

  // Fetch student's enrolled courses and their attendance records
  const [coursesRes, attendanceRes] = await Promise.all([
    fetchJson(`/courses/student/${studentId}`),
    fetchJson(`/attendance/student/${studentId}`)
  ]);

  const courses = (coursesRes || []).filter(c => !courseId || c.course_id == courseId);
  const attendanceRecords = attendanceRes || [];

  // Group attendance by course
  const attendanceByClass = {};
  attendanceRecords.forEach(record => {
    if (!attendanceByClass[record.course_id]) {
      attendanceByClass[record.course_id] = [];
    }
    attendanceByClass[record.course_id].push(record);
  });

  // Render attendance details
  const container = document.getElementById('attendanceDetailsContainer');
  if (!container) return;

  container.innerHTML = '';
  courses.forEach(course => {
    const records = attendanceByClass[course.course_id] || [];
    const present = records.filter(r => r.status?.toLowerCase() === 'present').length;
    const absent = records.filter(r => r.status?.toLowerCase() === 'absent').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    const circleColor = percentage >= 80 ? 'var(--pastel-mint)' : '#ff6b6b';
    const lowAttendanceClass = percentage < 80 ? 'low-attendance' : '';

    // Sort records by date (newest first)
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

    const section = document.createElement('div');
    section.className = 'attendance-detail-wrapper';
    section.innerHTML = `
      <div class="attendance-detail-card">
        <div class="attendance-detail-header">
          <h3>${course.course_name}</h3>
          <span class="course-code">${course.course_code || 'N/A'}</span>
        </div>
        <div class="attendance-detail-content">
          <div class="circle-progress-container">
            <svg class="circular-progress" width="140" height="140" viewBox="0 0 140 140">
              <circle class="progress-bg" cx="70" cy="70" r="65" />
              <circle class="progress-fill ${lowAttendanceClass}" cx="70" cy="70" r="65" style="--percentage: ${percentage}" />
            </svg>
            <div class="circle-percentage" style="--color: ${circleColor}">${percentage}%</div>
          </div>
          <div class="attendance-stats-detail">
            <div class="stat-box">
              <span class="stat-label">Total Classes</span>
              <span class="stat-value">${total}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Present</span>
              <span class="stat-value text-success">${present}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Absent</span>
              <span class="stat-value text-danger">${absent}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Attendance Rate</span>
              <span class="stat-value" style="color: ${percentage >= 80 ? '#27ae60' : '#e74c3c'}">${percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="attendance-records-section">
        <h3>Attendance Records</h3>
        ${total === 0 ? '<p class="empty-state">No attendance records available</p>' : `
          <div class="attendance-records-table">
            <div class="table-header">
              <div class="col-date">Date</div>
              <div class="col-status">Status</div>
              <div class="col-badge"></div>
            </div>
            <div class="table-body">
              ${sortedRecords.map((record, index) => {
                const date = new Date(record.date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                });
                const isPresent = record.status?.toLowerCase() === 'present';
                const badgeColor = isPresent ? '#27ae60' : '#e74c3c';
                const badgeText = isPresent ? 'Present' : 'Absent';
                
                return `
                  <div class="table-row ${isPresent ? 'present-row' : 'absent-row'}">
                    <div class="col-date">
                      <span class="date-text">${formattedDate}</span>
                    </div>
                    <div class="col-status">
                      <span class="status-badge" style="background: ${badgeColor}20; color: ${badgeColor}; border-left: 4px solid ${badgeColor}">
                        ${badgeText}
                      </span>
                    </div>
                    <div class="col-badge">
                      <span class="record-indicator" style="background: ${badgeColor}"></span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}
      </div>
    `;
    container.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadAttendanceDetail();
});
