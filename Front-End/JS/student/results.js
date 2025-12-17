/* ============================================================
   EDU Track - Student Results Page (Clean Table Version)
   Matches Courses Page Layout
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
      } catch (err) {
        console.debug('[fetchJson] candidate failed', url, err.message);
      }
    }
  } catch (e) {
    console.error('[fetchJson] failed', e);
    return null;
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
  const points = {
    'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0,
    'C+': 2.7, 'C': 2.3, 'D': 2.0, 'F': 0.0
  };
  return points[grade] || 0;
}

function calculateGPA(results) {
  if (results.length === 0) return 0;

  const totalPoints = results.reduce((sum, r) =>
    sum + getPoints(getGrade(r.marks_obtained)) * (r.credits || 1), 0);

  const totalCredits = results.reduce((sum, r) =>
    sum + (r.credits || 1), 0);

  return totalPoints / totalCredits;
}

async function loadResults() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  const container = document.getElementById('resultsTableContainer');
  if (!studentId) {
    container.innerHTML = `<p class="empty-state">Please log in to view results</p>`;
    return;
  }

  // Fetch marks + courses (using /marks instead of /grades)
  const [marksRes, coursesRes] = await Promise.all([
    fetchJson('/marks'),
    fetchJson('/courses')
  ]);

  const marks = (marksRes || []).filter(m => m.student_id === studentId);
  const courses = coursesRes || [];

  const results = marks.map(m => {
    const course = courses.find(c => c.course_id === m.course_id);
    return {
      ...m,
      course_name: course?.course_name || 'N/A',
      course_code: course?.course_code || 'N/A',
      credits: course?.credit_hours || 0,
      marks_obtained: m.total_marks  // Use total_marks from marks table
    };
  });

  // GPA display
  const gpa = calculateGPA(results);
  const gpaElement = document.getElementById('gpaScore');
  if (gpaElement) gpaElement.textContent = gpa.toFixed(2);

  // Render table
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = `<p class="empty-state">No grades recorded yet</p>`;
    return;
  }

  const tableHtml = `
    <div class="assessment-table-section">
      <h3>Academic Results</h3>
      <table class="assessment-table courses-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Credits</th>
            <th>Total Weightage</th>
            <th>Grade</th>
            <th>Grade Points</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .map(r => {
              const grade = getGrade(r.marks_obtained);
              const points = getPoints(grade);
              return `
              <tr class="clickable-row" onclick="viewCourseMarks(${r.course_id})" style="cursor: pointer;">
                <td class="course-code"><strong>${r.course_code}</strong></td>
                <td class="course-name">${r.course_name}</td>
                <td class="credits">${r.credits}</td>
                <td class="marks-value">${r.marks_obtained.toFixed(2)} / 100</td>
                <td class="grade-value"><span class="grade-badge grade-${grade.toLowerCase().replace(/\+/g,'plus')}">${grade}</span></td>
                <td class="points-value">${points.toFixed(2)}</td>
              </tr>
            `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHtml;
}

// redirect to marks page
function viewCourseMarks(courseId) {
  window.location.href = `/pages/student_pages/course_marks.html?courseId=${courseId}`;
}

// Auto refresh
let refreshInterval = null;

function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (!document.hidden) loadResults();
  }, 30000);
}

function stopAutoRefresh() {
  clearInterval(refreshInterval);
}

document.addEventListener('DOMContentLoaded', () => {
  loadResults();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  document.hidden ? stopAutoRefresh() : startAutoRefresh();
});
