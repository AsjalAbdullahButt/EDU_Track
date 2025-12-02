/* ============================================================
   EDU Track - Student Results Page
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
      console.error('[results] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadResults() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch grades and courses
  const [gradesRes, coursesRes] = await Promise.all([
    fetchJson(`/grades`),
    fetchJson('/courses')
  ]);

  const grades = (gradesRes || []).filter(g => g.student_id === studentId);
  const courses = coursesRes || [];

  // Merge with course info
  const results = grades.map(g => {
    const course = courses.find(c => c.course_id === g.course_id);
    return { ...g, course_name: course?.course_name, course_code: course?.course_code, credits: course?.credits };
  });

  // Calculate GPA
  const gpa = calculateGPA(results);
  if (document.getElementById('gpaScore')) {
    document.getElementById('gpaScore').textContent = gpa.toFixed(2);
  }

  // Render results table
  const container = document.getElementById('resultsTableContainer');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = '<p class="empty-state">No grades recorded yet</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'results-table';
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
  `;
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

function getPoints(grade) {
  const points = { 'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0, 'C+': 2.7, 'C': 2.3, 'D': 2.0, 'F': 0.0 };
  return points[grade] || 0;
}

function calculateGPA(results) {
  if (results.length === 0) return 0;
  const totalPoints = results.reduce((sum, r) => sum + (getPoints(getGrade(r.marks)) * (r.credits || 1)), 0);
  const totalCredits = results.reduce((sum, r) => sum + (r.credits || 1), 0);
  return totalPoints / totalCredits;
}

// Auto-refresh every 30 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadResults();
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadResults();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
      const fallback = document.getElementById('semesterGpa') && parseFloat(document.getElementById('semesterGpa').textContent);
      const gpa = (isNaN(fallback) ? 0 : fallback);
      animateGpa(gpa || 0);
    });

  // Wire Transcript button
  const tBtn = document.getElementById('downloadTranscript');
  if (tBtn) tBtn.addEventListener('click', () => window.location.href = '/pages/student_pages/transcript.html');
});
