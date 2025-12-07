/* ============================================================
   EDU Track - Faculty Manage Attendance
   ============================================================ */

const attendanceData = {};
let currentStudents = [];

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
      console.error('[manage_attendance] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadFacultyCourses() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = user.id;

  if (!facultyId) {
    if (window.showToast) window.showToast('Not logged in as faculty', 'error');
    return;
  }

  const courses = await fetchJson(`/courses/faculty/${facultyId}`);
  const select = document.getElementById('courseSelect');
  
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Course --</option>';
  
  if (courses && courses.length > 0) {
    courses.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.course_id;
      opt.textContent = `${c.course_code} - ${c.course_name}`;
      select.appendChild(opt);
    });
  } else {
    select.innerHTML = '<option value="">No courses assigned</option>';
  }
}

async function loadAttendance() {
  const date = document.getElementById('attendanceDate').value;
  const courseId = document.getElementById('courseSelect').value;
  const container = document.getElementById('attendanceTableContainer');

  if (!date || !courseId) {
    container.innerHTML = '<p class="empty-state">Select a course and date to load attendance</p>';
    document.getElementById('saveBtn').disabled = true;
    return;
  }

  // Fetch enrollments for this course
  const enrollments = await fetchJson(`/enrollments/course/${courseId}`);
  
  if (!enrollments || enrollments.length === 0) {
    container.innerHTML = '<p class="empty-state">No students enrolled in this course</p>';
    document.getElementById('saveBtn').disabled = true;
    return;
  }

  // Fetch existing attendance for this course and date
  const existingAttendance = await fetchJson(`/attendance/course/${courseId}`);
  const attendanceMap = {};
  
  if (existingAttendance) {
    existingAttendance
      .filter(a => a.date === date)
      .forEach(a => {
        attendanceMap[a.student_id] = a.status;
      });
  }

  // Fetch student details
  const students = await fetchJson('/students');
  const studentMap = {};
  if (students) {
    students.forEach(s => studentMap[s.student_id] = s);
  }

  // Build attendance data
  currentStudents = enrollments.map(e => {
    const student = studentMap[e.student_id] || {};
    return {
      student_id: e.student_id,
      full_name: student.full_name || 'Unknown',
      email: student.email || '',
      status: attendanceMap[e.student_id] || 'Absent'
    };
  });

  // Render table
  container.innerHTML = `
    <table class="data-table" id="attendanceTable">
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${currentStudents.map((s, idx) => `
          <tr>
            <td>${s.student_id}</td>
            <td>${s.full_name}</td>
            <td>${s.email}</td>
            <td>
              <button class="toggle-btn ${s.status === 'Present' ? 'present' : 'absent'}" 
                      onclick="toggleAttendance(${idx}, this)">
                ${s.status}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.getElementById('saveBtn').disabled = false;
}

function toggleAttendance(idx, btn) {
  const student = currentStudents[idx];
  student.status = student.status === 'Present' ? 'Absent' : 'Present';
  btn.textContent = student.status;
  btn.className = `toggle-btn ${student.status === 'Present' ? 'present' : 'absent'}`;
}

function markAllAbsent() {
  const date = document.getElementById('attendanceDate').value;
  const courseId = document.getElementById('courseSelect').value;
  
  if (!date || !courseId) {
    if (window.showToast) window.showToast('Select a course and date first', 'warning');
    return;
  }

  currentStudents.forEach(s => s.status = 'Absent');
  loadAttendance();
}

async function saveAttendance() {
  const date = document.getElementById('attendanceDate').value;
  const courseId = document.getElementById('courseSelect').value;
  
  if (!date || !courseId || currentStudents.length === 0) {
    if (window.showToast) window.showToast('No attendance data to save', 'warning');
    return;
  }

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    // Save each attendance record
    const promises = currentStudents.map(s => {
      const payload = {
        student_id: s.student_id,
        course_id: parseInt(courseId),
        date: date,
        status: s.status
      };
      return fetch('http://127.0.0.1:8000/attendance/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    });

    await Promise.all(promises);
    
    if (window.showToast) window.showToast('Attendance saved successfully', 'success');
  } catch (error) {
    console.error('Error saving attendance:', error);
    if (window.showToast) window.showToast('Failed to save attendance', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Attendance';
  }
}

window.loadAttendance = loadAttendance;
window.toggleAttendance = toggleAttendance;
window.markAllAbsent = markAllAbsent;
window.saveAttendance = saveAttendance;

document.addEventListener('DOMContentLoaded', () => {
  // Set today's date as default
  const dateInput = document.getElementById('attendanceDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Load faculty courses
  loadFacultyCourses();
});
