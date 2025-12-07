/* ============================================================
   EDU Track - My Students (Faculty)
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
      console.error('[my_students] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

let allStudentsData = [];
let allCoursesData = [];

async function loadMyStudents() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch data
  const [coursesRes, enrollmentsRes, studentsRes] = await Promise.all([
    fetchJson(`/courses/faculty/${facultyId}`),
    fetchJson('/enrollments'),
    fetchJson('/students')
  ]);

  allCoursesData = coursesRes || [];
  const allEnrollments = enrollmentsRes || [];
  const allStudents = studentsRes || [];

  // Filter enrollments for this faculty's courses
  const myCourseIds = allCoursesData.map(c => c.course_id);
  const myEnrollments = allEnrollments.filter(e => myCourseIds.includes(e.course_id));
  
  // Get unique students
  const uniqueStudentIds = [...new Set(myEnrollments.map(e => e.student_id))];
  
  // Build student data with enrollments
  allStudentsData = uniqueStudentIds.map(studentId => {
    const student = allStudents.find(s => s.student_id === studentId);
    const enrollments = myEnrollments.filter(e => e.student_id === studentId);
    return {
      ...student,
      enrollments: enrollments.map(e => {
        const course = allCoursesData.find(c => c.course_id === e.course_id);
        return { ...e, course };
      })
    };
  }).filter(s => s.student_id); // Remove any nulls

  // Update stats
  document.getElementById('totalStudents').textContent = uniqueStudentIds.length;
  document.getElementById('totalCourses').textContent = allCoursesData.length;
  document.getElementById('activeEnrollments').textContent = myEnrollments.filter(e => e.status === 'Active').length;

  // Populate course filter
  const courseFilter = document.getElementById('courseFilter');
  courseFilter.innerHTML = '<option value="">All Courses</option>' + 
    allCoursesData.map(c => `<option value="${c.course_id}">${c.course_code} - ${c.course_name}</option>`).join('');

  // Render table
  renderStudentsTable(allStudentsData);
}

function renderStudentsTable(students) {
  const tbody = document.getElementById('studentsTableBody');
  
  if (!students || students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No students found</td></tr>';
    return;
  }

  tbody.innerHTML = students.flatMap(student => {
    return student.enrollments.map((enrollment, idx) => `
      <tr>
        ${idx === 0 ? `<td rowspan="${student.enrollments.length}">${student.student_id}</td>` : ''}
        ${idx === 0 ? `<td rowspan="${student.enrollments.length}">${student.name || 'N/A'}</td>` : ''}
        ${idx === 0 ? `<td rowspan="${student.enrollments.length}">${student.email || 'N/A'}</td>` : ''}
        <td>${enrollment.course?.course_code || 'N/A'} - ${enrollment.course?.course_name || 'N/A'}</td>
        <td>${enrollment.enrollment_date || 'N/A'}</td>
        <td><span class="status-badge ${enrollment.status?.toLowerCase()}">${enrollment.status || 'N/A'}</span></td>
        <td>
          <a href="/pages/dashboard/faculty/manage_attendance.html?course_id=${enrollment.course_id}" class="btn-small">Attendance</a>
        </td>
      </tr>
    `).join('');
  }).join('');
}

function filterStudents() {
  const courseId = document.getElementById('courseFilter').value;
  const searchTerm = document.getElementById('searchStudent').value.toLowerCase();

  let filtered = allStudentsData;

  // Filter by course
  if (courseId) {
    filtered = filtered.map(student => ({
      ...student,
      enrollments: student.enrollments.filter(e => e.course_id == courseId)
    })).filter(s => s.enrollments.length > 0);
  }

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(s => 
      s.name?.toLowerCase().includes(searchTerm) || 
      s.student_id?.toString().includes(searchTerm) ||
      s.email?.toLowerCase().includes(searchTerm)
    );
  }

  renderStudentsTable(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  loadMyStudents();

  document.getElementById('courseFilter').addEventListener('change', filterStudents);
  document.getElementById('searchStudent').addEventListener('input', filterStudents);
});
