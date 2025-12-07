/* ============================================================
   EDU Track - My Grades (Faculty)
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
      console.error('[my_grades] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

let allGradesData = [];
let allCoursesData = [];
let allStudentsData = [];

async function loadMyGrades() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch data
  const [coursesRes, gradesRes, studentsRes] = await Promise.all([
    fetchJson(`/courses/faculty/${facultyId}`),
    fetchJson('/grades'),
    fetchJson('/students')
  ]);

  allCoursesData = coursesRes || [];
  const allGrades = gradesRes || [];
  allStudentsData = studentsRes || [];

  // Filter grades for this faculty's courses
  const myCourseIds = allCoursesData.map(c => c.course_id);
  allGradesData = allGrades.filter(g => myCourseIds.includes(g.course_id));

  // Enrich grades with student and course info
  allGradesData = allGradesData.map(grade => {
    const student = allStudentsData.find(s => s.student_id === grade.student_id);
    const course = allCoursesData.find(c => c.course_id === grade.course_id);
    
    return {
      ...grade,
      student_name: student?.full_name || 'Unknown',
      course_name: course?.course_name || 'Unknown',
      course_code: course?.course_code || 'N/A',
      display_marks: grade.marks_obtained || 'N/A',
      display_date: grade.created_at ? new Date(grade.created_at).toLocaleDateString() : 'N/A'
    };
  });

  // Calculate stats
  const totalGrades = allGradesData.length;
  const avgGrade = totalGrades > 0 
    ? (allGradesData.reduce((sum, g) => sum + (parseFloat(g.marks_obtained) || 0), 0) / totalGrades).toFixed(2)
    : 0;
  const passingGrades = allGradesData.filter(g => ['A', 'B', 'C'].includes(g.grade)).length;
  const passingRate = totalGrades > 0 ? ((passingGrades / totalGrades) * 100).toFixed(1) : 0;

  // Update stats
  document.getElementById('totalGrades').textContent = totalGrades;
  document.getElementById('averageGrade').textContent = avgGrade;
  document.getElementById('passingRate').textContent = passingRate + '%';

  // Populate course filter
  const courseFilter = document.getElementById('courseFilter');
  courseFilter.innerHTML = '<option value="">All Courses</option>' + 
    allCoursesData.map(c => `<option value="${c.course_id}">${c.course_code} - ${c.course_name}</option>`).join('');

  // Render table
  renderGradesTable(allGradesData);
}

function renderGradesTable(grades) {
  const tbody = document.getElementById('gradesTableBody');
  
  if (!grades || grades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No grades found</td></tr>';
    return;
  }

  tbody.innerHTML = grades.map(grade => `
    <tr>
      <td>${grade.student_id}</td>
      <td>${grade.student_name}</td>
      <td>${grade.course_code}</td>
      <td><span class="grade-badge grade-${grade.grade?.toLowerCase()}">${grade.grade || 'N/A'}</span></td>
      <td>${grade.display_marks}</td>
      <td>${grade.semester || 'N/A'}</td>
      <td>${grade.display_date}</td>
    </tr>
  `).join('');
}

function filterGrades() {
  const courseId = document.getElementById('courseFilter').value;
  const gradeFilter = document.getElementById('gradeFilter').value;

  let filtered = allGradesData;

  if (courseId) {
    filtered = filtered.filter(g => g.course_id == courseId);
  }

  if (gradeFilter) {
    filtered = filtered.filter(g => g.grade === gradeFilter);
  }

  renderGradesTable(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  loadMyGrades();

  document.getElementById('courseFilter').addEventListener('change', filterGrades);
  document.getElementById('gradeFilter').addEventListener('change', filterGrades);
});
