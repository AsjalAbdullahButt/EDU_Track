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

  // Fetch courses and attendance records
  const [coursesRes, attendanceRes] = await Promise.all([
    fetchJson('/courses'),
    fetchJson(`/attendance`)
  ]);

  const courses = coursesRes || [];
  const attendanceRecords = (attendanceRes || []).filter(a => a.student_id === studentId);

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

    const section = document.createElement('div');
    section.className = 'attendance-section';
    section.innerHTML = `
      <h3>${course.course_name}</h3>
      <div class="attendance-stats">
        <div class="stat">
          <strong>Total Classes:</strong> ${total}
        </div>
        <div class="stat">
          <strong>Present:</strong> ${present}
        </div>
        <div class="stat">
          <strong>Absent:</strong> ${absent}
        </div>
        <div class="stat">
          <strong>Attendance %:</strong> <span class="percentage ${percentage >= 75 ? 'good' : 'warning'}">${percentage}%</span>
        </div>
      </div>
      <div class="attendance-progress">
        <div class="progress-bar" style="width: ${percentage}%"></div>
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
