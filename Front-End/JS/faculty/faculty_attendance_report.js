/* Faculty Attendance Report JS */
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
      } catch (e) {}
    }
  } catch (e) {
    try {
      const base2 = 'http://127.0.0.1:8000';
      for (const p of [path, path.endsWith('/') ? path : path + '/']) {
        try {
          const res2 = await fetch(base2 + p);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {}
      }
    } catch (e2) {}
  }
  return null;
}

async function loadAttendanceReport() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course_id');

  const [attendanceRes, enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
    fetchJson('/attendance'),
    fetchJson('/enrollments'),
    fetchJson('/students'),
    fetchJson('/courses')
  ]);

  const courses = (coursesRes || []).filter(c => c.faculty_id === facultyId);
  const enrollments = (enrollmentsRes || []).filter(e => courseId ? e.course_id === parseInt(courseId) : courses.find(c => c.course_id === e.course_id));
  const attendance = attendanceRes || [];
  const students = studentsRes || [];

  const container = document.getElementById('attendanceReportContainer');
  if (!container) return;

  if (attendance.length === 0) {
    container.innerHTML = '<p class="empty-state">No attendance records</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `<thead><tr><th>Student</th><th>Date</th><th>Status</th></tr></thead><tbody>
    ${attendance.map(a => {
      const st = students.find(s => s.student_id === a.student_id);
      return `<tr><td>${st?.full_name || 'N/A'}</td><td>${new Date(a.date).toLocaleDateString()}</td><td><span class="badge ${a.status.toLowerCase() === 'present' ? 'present' : 'absent'}">${a.status}</span></td></tr>`;
    }).join('')}
  </tbody>`;
  container.appendChild(table);
}

document.addEventListener('DOMContentLoaded', () => {
  try { protectDashboard('faculty'); } catch (e) { }
  loadAttendanceReport();
});
