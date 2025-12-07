/* ============================================================
   EDU Track - Faculty Grades Management - Student List
   Shows students enrolled in selected course
   Click on student to manage their marks
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
      console.error('[faculty_grades] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

let currentCourseData = null;

async function loadFacultyCourses() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  if (!facultyId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  const courses = await fetchJson(`/courses/faculty/${facultyId}`);
  const courseFilter = document.getElementById('courseFilter');
  
  if (courses && courses.length > 0) {
    courseFilter.innerHTML = '<option value="">Select Course</option>' +
      courses.map(c => `<option value="${c.course_id}" data-code="${c.course_code}" data-name="${c.course_name}">${c.course_code} - ${c.course_name}</option>`).join('');
  } else {
    courseFilter.innerHTML = '<option value="">No courses assigned</option>';
  }
}

async function loadStudentsList() {
  const courseFilter = document.getElementById('courseFilter');
  const courseId = courseFilter.value;
  
  if (!courseId) {
    document.getElementById('studentsListSection').style.display = 'none';
    return;
  }

  const selectedOption = courseFilter.options[courseFilter.selectedIndex];
  const courseCode = selectedOption.getAttribute('data-code');
  const courseName = selectedOption.getAttribute('data-name');
  
  document.getElementById('selectedCourseName').textContent = `${courseCode} - ${courseName}`;
  currentCourseData = { course_id: courseId, course_code: courseCode, course_name: courseName };

  // Fetch enrollments, marks, students, and grades
  const [enrollments, allMarks, students, grades] = await Promise.all([
    fetchJson(`/enrollments/course/${courseId}`),
    fetchJson('/marks'),
    fetchJson('/students'),
    fetchJson('/grades')
  ]);

  if (!enrollments || enrollments.length === 0) {
    document.getElementById('studentsGrid').innerHTML = '<div class="empty-state">No students enrolled in this course</div>';
    document.getElementById('studentsListSection').style.display = 'block';
    return;
  }

  // Build student cards
  const studentsHTML = enrollments.map(enrollment => {
    const student = students.find(s => s.student_id === enrollment.student_id);
    const marks = allMarks.find(m => m.student_id === enrollment.student_id && m.course_id == courseId);
    const grade = grades.find(g => g.student_id === enrollment.student_id && g.course_id == courseId);
    
    const totalMarks = marks?.total_marks || 0;
    const letterGrade = grade?.grade || 'Not Graded';
    const hasMarks = marks !== undefined;

    return `
      <div class="student-card" onclick="openStudentMarks(${enrollment.student_id}, ${courseId}, '${student?.full_name || 'Unknown'}', '${courseCode}', '${courseName}')">
        <div class="student-info">
          <h3>${student?.full_name || 'Unknown'}</h3>
          <p class="student-id">ID: ${enrollment.student_id}</p>
          <p class="student-email">${student?.email || '-'}</p>
        </div>
        <div class="student-grade-info">
          <div class="marks-display">
            <span class="label">Total Marks</span>
            <span class="value">${totalMarks.toFixed(2)}/100</span>
          </div>
          <div class="grade-display">
            <span class="grade-badge grade-${letterGrade.toLowerCase().replace('+', 'plus').replace('-', 'minus')}">${letterGrade}</span>
          </div>
          <div class="status-badge ${hasMarks ? 'status-complete' : 'status-pending'}">
            ${hasMarks ? '✓ Graded' : '⚠ Pending'}
          </div>
        </div>
        <div class="card-arrow">→</div>
      </div>
    `;
  }).join('');

  document.getElementById('studentsGrid').innerHTML = studentsHTML;
  document.getElementById('studentsListSection').style.display = 'block';
}

function openStudentMarks(studentId, courseId, studentName, courseCode, courseName) {
  // Store data in sessionStorage for the marks entry page
  sessionStorage.setItem('marksEntry', JSON.stringify({
    student_id: studentId,
    course_id: courseId,
    student_name: studentName,
    course_code: courseCode,
    course_name: courseName
  }));
  
  // Navigate to marks entry page
  window.location.href = '/pages/dashboard/faculty/student_marks_entry.html';
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  loadFacultyCourses();
});
