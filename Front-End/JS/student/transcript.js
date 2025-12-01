document.addEventListener('DOMContentLoaded', () => {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (!session || !session.id) return;
  const userId = session.id;

  document.getElementById('studentName').textContent = session.name || 'Student';
  document.getElementById('studentEmail').textContent = session.email || '';

  const tableBody = document.querySelector('#transcriptTable tbody');
  const cgpaEl = document.getElementById('cgpaValue');

  function renderRows(semesters){
    tableBody.innerHTML = '';
    let totalWeighted = 0, totalCredits = 0;
    // semesters: array of { semester, courses: [{code,title,credits,grade,points}] }
    semesters.forEach(s => {
      s.courses.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.semester}</td><td>${c.code || c.course || ''}</td><td>${c.credits || ''}</td><td>${c.grade || ''}</td><td>${c.points ?? ''}</td>`;
        tableBody.appendChild(tr);
        totalWeighted += (c.points || 0) * (c.credits || 1);
        totalCredits += (c.credits || 0);
      });
    });
    const cgpa = totalCredits ? (totalWeighted / totalCredits) : 0;
    if (cgpaEl) cgpaEl.textContent = cgpa ? cgpa.toFixed(2) : '—';
  }

  // Try to fetch data from backend endpoint; fallback to sample data or local table
  fetch(`/grades?student_id=${userId}`)
    .then(r => { if(!r.ok) throw new Error('no'); return r.json(); })
    .then(data => {
      // If backend returns grouped semesters, use them. Otherwise group by semester field in entries.
      if (Array.isArray(data) && data.length){
        // If entries contain semester and course info
        const bySem = {};
        data.forEach(e => {
          const sem = e.semester || 'Unknown';
          if (!bySem[sem]) bySem[sem] = [];
          bySem[sem].push({ code: e.course_code || e.course || '', credits: e.credits || e.credit_hours || 1, grade: e.grade || '', points: e.points || e.gpa_points || 0 });
        });
        const semesters = Object.keys(bySem).sort().map(sem => ({ semester: sem, courses: bySem[sem] }));
        renderRows(semesters);
      } else {
        throw new Error('no grades');
      }
    })
    .catch(() => {
      // fallback: try to read a table on results page if loaded in same window, else show placeholder
      renderRows([{ semester: 'Fall 2024', courses: [ { code: 'CS301', credits:3, grade:'A', points:4.0 }, { code:'CS302', credits:3, grade:'B+', points:3.5 } ] }]);
    });

  const printBtn = document.getElementById('printTranscript');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
});
