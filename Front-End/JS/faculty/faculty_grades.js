/* Faculty Grades JS - Load grades by course */
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
      const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
      for (const p of candidates2) {
        const fallback = base2 + p;
        try {
          const res2 = await fetch(fallback, opts);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {}
      }
    } catch (e2) {
      console.error('[fetchJson]', path, e, e2);
      return null;
    }
  }
  return null;
}

async function loadFacultyGrades() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  const [marksRes, studentsRes, coursesRes] = await Promise.all([
    fetchJson('/marks'),
    fetchJson('/students'),
    fetchJson('/courses')
  ]);

  const courses = (coursesRes || []).filter(c => c.faculty_id === facultyId);
  const courseIds = courses.map(c => c.course_id);
  const marks = (marksRes || []).filter(m => courseIds.includes(m.course_id));
  const students = studentsRes || [];

  const container = document.getElementById('gradesContainer');
  if (!container) return;

  if (marks.length === 0) {
    container.innerHTML = '<p class="empty-state">No marks recorded</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `<thead><tr><th>Student</th><th>Course</th><th>Marks</th><th>Grade</th></tr></thead><tbody>
    ${marks.map(m => {
      const st = students.find(s => s.student_id === m.student_id);
      const cr = courses.find(c => c.course_id === m.course_id);
      return `<tr><td>${st?.full_name || 'N/A'}</td><td>${cr?.course_name || 'N/A'}</td><td>${m.total_marks || 0}</td><td>${m.grade_letter || getGrade(m.total_marks)}</td></tr>`;
    }).join('')}
  </tbody>`;
  container.appendChild(table);
}

function getGrade(marks) {
  if (marks >= 85) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'C+';
  if (marks >= 60) return 'C';
  if (marks >= 55) return 'D';
  return 'F';
}

document.addEventListener('DOMContentLoaded', () => {
  try { protectDashboard('faculty'); } catch (e) { }
  loadFacultyGrades();
});
