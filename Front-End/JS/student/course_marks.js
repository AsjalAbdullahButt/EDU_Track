/* ============================================================
   EDU Track - Student Course Marks Page (reworked for Option A)
   Generates one card+table per assessment (Quizzes, Assignments, Midterms, Final)
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
        console.debug('[course_marks] candidate failed', url, e.message);
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
          console.debug('[course_marks] fallback failed', fallback, e2.message);
        }
      }
    } catch (e2) {
      console.error('[course_marks] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

function getCourseIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('courseId');
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

function safeFixed(val, digits = 2) {
  const n = parseFloat(val || 0);
  return isNaN(n) ? (0).toFixed(digits) : n.toFixed(digits);
}

async function loadCourseMarks() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;
  const courseId = getCourseIdFromURL();

  const container = document.getElementById('assessmentTablesContainer');
  if (!container) return;

  if (!studentId) {
    console.error('[course_marks] Not logged in');
    container.innerHTML = '<p class="empty-state">Please log in to view marks</p>';
    return;
  }

  if (!courseId) {
    console.error('[course_marks] No course selected');
    container.innerHTML = '<p class="empty-state">No course selected. <a href="/pages/student_pages/results.html">Go back</a></p>';
    return;
  }

  // Fetch marks, course info and all course marks for stats
  const [marksRes, coursesRes, allCourseMarksRes] = await Promise.all([
    fetchJson(`/marks/student/${studentId}/course/${courseId}`),
    fetchJson('/courses/'),
    fetchJson(`/marks/course/${courseId}`)
  ]);

  if (!coursesRes) {
    container.innerHTML = '<p class="empty-state">Failed to load course data</p>';
    return;
  }

  const courses = coursesRes || [];
  const course = courses.find(c => c.course_id == courseId);
  if (!course) {
    container.innerHTML = '<p class="empty-state">Course not found</p>';
    return;
  }

  if (!marksRes || (Array.isArray(marksRes) && marksRes.length === 0)) {
    container.innerHTML = '<p class="empty-state">No marks recorded for this course yet</p>';
    return;
  }

  const marks = Array.isArray(marksRes) ? marksRes[0] : marksRes;

  document.getElementById('courseTitle').textContent = course.course_name || 'Course Marks';
  document.getElementById('courseSubtitle').textContent = `${course.course_code || 'N/A'} - Detailed assessment breakdown`;

  // Build assessmentStats from class marks (if available)
  const keys = ['quiz1','quiz2','quiz3','quiz_total','assignment1','assignment2','assignment3','assignment_total','midterm1','midterm2','final_exam'];
  const assessmentStats = {};
  keys.forEach(k => assessmentStats[k] = { values: [], avg: 0, min: 0, max: 0 });

  if (allCourseMarksRes && Array.isArray(allCourseMarksRes) && allCourseMarksRes.length > 0) {
    allCourseMarksRes.forEach(m => {
      keys.forEach(k => {
        const val = parseFloat(m[k]) || 0;
        assessmentStats[k].values.push(val);
      });
    });
    Object.keys(assessmentStats).forEach(k => {
      const v = assessmentStats[k].values;
      if (v.length > 0) {
        const sum = v.reduce((a,b) => a + b, 0);
        assessmentStats[k].avg = (sum / v.length).toFixed(2);
        assessmentStats[k].min = Math.min(...v).toFixed(2);
        assessmentStats[k].max = Math.max(...v).toFixed(2);
      }
    });
  }

  // Define the table content structure (keeps same items as original)
  const assessmentTables = [
    {
      name: 'Quizzes',
      type: 'quiz',
      items: [
        { label: 'Quiz 1', value: marks.quiz1, key: 'quiz1' },
        { label: 'Quiz 2', value: marks.quiz2, key: 'quiz2' },
        { label: 'Quiz 3', value: marks.quiz3, key: 'quiz3' },
        { label: 'Quiz Total', value: marks.quiz_total, key: 'quiz_total', isTotal: true, totalWeightage: 10 }
      ]
    },
    {
      name: 'Assignments',
      type: 'assignment',
      items: [
        { label: 'Assignment 1', value: marks.assignment1, key: 'assignment1' },
        { label: 'Assignment 2', value: marks.assignment2, key: 'assignment2' },
        { label: 'Assignment 3', value: marks.assignment3, key: 'assignment3' },
        { label: 'Assignment Total', value: marks.assignment_total, key: 'assignment_total', isTotal: true, totalWeightage: 10 }
      ]
    },
    {
      name: 'Midterm 1',
      type: 'exam',
      items: [
        { label: 'Midterm 1', value: marks.midterm1, key: 'midterm1', weightage: 15 }
      ]
    },
    {
      name: 'Midterm 2',
      type: 'exam',
      items: [
        { label: 'Midterm 2', value: marks.midterm2, key: 'midterm2', weightage: 15 }
      ]
    },
    {
      name: 'Final Exam',
      type: 'exam',
      items: [
        { label: 'Final Exam', value: marks.final_exam, key: 'final_exam', weightage: 50 }
      ]
    }
  ];

  // Helper to build a table for quizzes/assignments
  function buildTableForList(section) {
    const rows = section.items.map(item => {
      const stats = assessmentStats[item.key] || { avg: '0.00', min: '0.00', max: '0.00' };
      if (item.isTotal) {
        // Total rows show computed weightage (using equal split approach used previously)
        const prevItems = section.items.slice(0, -1);
        const weightageObtained = prevItems.reduce((sum, prevItem) => {
          const prevMarks = parseFloat(prevItem.value || 0);
          // previous implementation used 3.333 per task to give 10 total for 3 quizzes/assignments
          return sum + ((prevMarks / 100) * 3.333);
        }, 0);
        const avgWeightage = prevItems.reduce((sum, prevItem) => {
          const prevStats = assessmentStats[prevItem.key] || { avg: 0 };
          return sum + ((parseFloat(prevStats.avg || 0) / 100) * 3.333);
        }, 0);
        const minWeightage = prevItems.reduce((sum, prevItem) => {
          const prevStats = assessmentStats[prevItem.key] || { min: 0 };
          return sum + ((parseFloat(prevStats.min || 0) / 100) * 3.333);
        }, 0);
        const maxWeightage = prevItems.reduce((sum, prevItem) => {
          const prevStats = assessmentStats[prevItem.key] || { max: 0 };
          return sum + ((parseFloat(prevStats.max || 0) / 100) * 3.333);
        }, 0);

        return `
          <tr class="total-row">
            <td class="assessment-label">${item.label}</td>
            <td class="marks-value">${safeFixed(weightageObtained)}</td>
            <td class="average-value">${safeFixed(avgWeightage)}</td>
            <td class="minimum-value">${safeFixed(minWeightage)}</td>
            <td class="maximum-value">${safeFixed(maxWeightage)}</td>
          </tr>
        `;
      } else {
        const obtained = safeFixed(item.value);
        return `
          <tr>
            <td class="assessment-label">${item.label}</td>
            <td class="marks-value">${obtained}</td>
            <td class="average-value">${safeFixed(stats.avg)}</td>
            <td class="minimum-value">${safeFixed(stats.min)}</td>
            <td class="maximum-value">${safeFixed(stats.max)}</td>
          </tr>
        `;
      }
    }).join('');

    return `
      <div class="assessment-table-section">
        <h3>${section.name}</h3>
        <table class="assessment-table courses-table" aria-describedby="${section.name}-desc">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Obtained</th>
              <th>Class Average</th>
              <th>Minimum</th>
              <th>Maximum</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  function buildTableForExam(section) {
    const item = section.items[0];
    const stats = assessmentStats[item.key] || { avg: 0 };
    const marksObtained = parseFloat(item.value || 0);
    const weightageObtained = ((marksObtained / 100) * (item.weightage || 0));
    return `
      <div class="assessment-table-section">
        <h3>${section.name}</h3>
        <table class="assessment-table courses-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Obtained Marks</th>
              <th>Total Marks</th>
              <th>Class Average</th>
              <th>Weightage Obtained</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="assessment-label">${item.label}</td>
              <td class="marks-value">${safeFixed(marksObtained)}</td>
              <td class="total-value">100</td>
              <td class="average-value">${safeFixed(stats.avg)}</td>
              <td class="weightage-value">${safeFixed(weightageObtained)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // Render each assessment section
  let html = '';
  assessmentTables.forEach(section => {
    if (section.type === 'quiz' || section.type === 'assignment') {
      html += buildTableForList(section);
    } else {
      html += buildTableForExam(section);
    }
  });

  // Compute total weightage summary
  const quizWeightage = assessmentTables[0].items.slice(0, -1).reduce((sum, item) => {
    const itemMarks = parseFloat(item.value || 0);
    return sum + ((itemMarks / 100) * 3.333);
  }, 0);

  const assignmentWeightage = assessmentTables[1].items.slice(0, -1).reduce((sum, item) => {
    const itemMarks = parseFloat(item.value || 0);
    return sum + ((itemMarks / 100) * 3.333);
  }, 0);

  const midterm1Weightage = ((parseFloat(marks.midterm1 || 0) / 100) * 15);
  const midterm2Weightage = ((parseFloat(marks.midterm2 || 0) / 100) * 15);
  const finalWeightage = ((parseFloat(marks.final_exam || 0) / 100) * 50);

  const totalWeightageObtained = (quizWeightage + assignmentWeightage + midterm1Weightage + midterm2Weightage + finalWeightage);
  const totalWeightageGrade = getGrade(parseFloat(totalWeightageObtained));
  
  console.log('[course_marks] Total Weightage:', totalWeightageObtained);
  console.log('[course_marks] Grade:', totalWeightageGrade);

  const summaryTableHtml = `
    <div class="assessment-table-section total-weightage-summary">
      <h3>Total Weightage Summary</h3>
      <table class="assessment-table courses-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Weightage Obtained</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="assessment-label">Quiz Total</td><td class="marks-value">${safeFixed(quizWeightage)}</td></tr>
          <tr><td class="assessment-label">Assignment Total</td><td class="marks-value">${safeFixed(assignmentWeightage)}</td></tr>
          <tr><td class="assessment-label">Midterm 1</td><td class="marks-value">${safeFixed(midterm1Weightage)}</td></tr>
          <tr><td class="assessment-label">Midterm 2</td><td class="marks-value">${safeFixed(midterm2Weightage)}</td></tr>
          <tr><td class="assessment-label">Final Exam</td><td class="marks-value">${safeFixed(finalWeightage)}</td></tr>
          <tr class="total-row">
            <td class="assessment-label"><strong>Total Weightage Obtained</strong></td>
            <td class="weightage-value"><strong>${safeFixed(totalWeightageObtained)} / 100</strong></td>
          </tr>
          <tr class="grade-row">
            <td class="assessment-label"><strong>Grade</strong></td>
            <td class="grade-value"><span class="grade-badge grade-${totalWeightageGrade.toLowerCase().replace(/\+/g,'plus')}">${totalWeightageGrade}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html + summaryTableHtml;
}

document.addEventListener('DOMContentLoaded', () => {
  try { protectDashboard && protectDashboard('student'); } catch (e) { console.debug('[course_marks] protectDashboard not available'); }
  loadCourseMarks();
});
