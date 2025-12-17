/* ============================================================
   EDU Track - Student Semester Results & Transcript Pages
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
      console.error('[semester/transcript] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
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

function getPoints(grade) {
  const points = { 'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0, 'C+': 2.7, 'C': 2.3, 'D': 2.0, 'F': 0.0 };
  return points[grade] || 0;
}

async function loadSemesterResults() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  const [gradesRes, coursesRes] = await Promise.all([
    fetchJson(`/grades`),
    fetchJson('/courses')
  ]);

  const grades = (gradesRes || []).filter(g => g.student_id === studentId);
  const courses = coursesRes || [];

  // Group by semester
  const semesters = {};
  grades.forEach(g => {
    const sem = g.semester || '1';
    if (!semesters[sem]) semesters[sem] = [];
    const course = courses.find(c => c.course_id === g.course_id);
    semesters[sem].push({ ...g, course_name: course?.course_name, course_code: course?.course_code, credits: course?.credits });
  });

  const container = document.getElementById('semesterResultsContainer');
  if (!container) return;

  if (Object.keys(semesters).length === 0) {
    container.innerHTML = '<p class="empty-state">No semester results available</p>';
    return;
  }

  container.innerHTML = Object.keys(semesters).sort().reverse().map(sem => {
    const results = semesters[sem];
    let totalPoints = 0, totalCredits = 0;
    results.forEach(r => {
      const credits = r.credits || 1;
      totalPoints += getPoints(getGrade(r.marks)) * credits;
      totalCredits += credits;
    });
    const sgpa = totalCredits ? (totalPoints / totalCredits) : 0;

    return `
      <div class="semester-section">
        <h3>Semester ${sem}</h3>
        <div class="semester-gpa">SGPA: <strong>${sgpa.toFixed(2)}</strong></div>
        <table class="results-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => {
              const grade = getGrade(r.marks);
              const points = getPoints(grade);
              return `
                <tr>
                  <td>${r.course_code || 'N/A'}</td>
                  <td>${r.course_name || 'N/A'}</td>
                  <td>${r.credits || 0}</td>
                  <td>${r.marks || 0}</td>
                  <td><strong class="grade-${grade.toLowerCase()}">${grade}</strong></td>
                  <td>${points}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

async function loadTranscript() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  const [gradesRes, coursesRes, studentRes] = await Promise.all([
    fetchJson(`/grades`),
    fetchJson('/courses'),
    fetchJson(`/students/${studentId}`)
  ]);

  const grades = (gradesRes || []).filter(g => g.student_id === studentId);
  const courses = coursesRes || [];
  const student = studentRes || {};

  // Display student info
  if (document.getElementById('transcriptStudentName')) {
    document.getElementById('transcriptStudentName').textContent = student.name || 'Student';
  }
  if (document.getElementById('transcriptStudentId')) {
    document.getElementById('transcriptStudentId').textContent = student.student_id || 'N/A';
  }
  if (document.getElementById('transcriptDepartment')) {
    document.getElementById('transcriptDepartment').textContent = student.department || 'N/A';
  }

  // Calculate overall GPA
  let totalPoints = 0, totalCredits = 0;
  const results = grades.map(g => {
    const course = courses.find(c => c.course_id === g.course_id);
    const credits = course?.credits || 1;
    const grade = getGrade(g.marks);
    const points = getPoints(grade);
    totalPoints += points * credits;
    totalCredits += credits;
    return { ...g, course_name: course?.course_name, course_code: course?.course_code, credits, grade, points };
  });

  const cgpa = totalCredits ? (totalPoints / totalCredits) : 0;
  if (document.getElementById('transcriptCGPA')) {
    document.getElementById('transcriptCGPA').textContent = cgpa.toFixed(2);
  }

  // Render transcript table
  const container = document.getElementById('transcriptTableContainer');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = '<p class="empty-state">No grades recorded</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'transcript-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Course Code</th>
        <th>Course Name</th>
        <th>Credits</th>
        <th>Marks</th>
        <th>Grade</th>
        <th>Points</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(r => `
        <tr>
          <td>${r.course_code || 'N/A'}</td>
          <td>${r.course_name || 'N/A'}</td>
          <td>${r.credits || 0}</td>
          <td>${r.marks || 0}</td>
          <td><strong class="grade-${r.grade.toLowerCase()}">${r.grade}</strong></td>
          <td>${r.points}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

function printTranscript() {
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  if (document.getElementById('semesterResultsContainer')) loadSemesterResults();
  if (document.getElementById('transcriptTableContainer')) loadTranscript();
});
