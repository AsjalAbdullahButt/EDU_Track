/* =======================================================
   EDU Track - Results Script (results.js)
   Animates results table and computes GPA
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector('.data-table tbody') || document.querySelector('#resultsTable tbody');
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  const gradePoints = { A:4.0, B:3.0, C:2.0, D:1.0, F:0.0 };

  function styleRow(row, grade){
    const gradeCell = row.querySelector('.grade') || row.querySelector('td.grade');
    if (!gradeCell) return;
    switch(grade){
      case 'A': gradeCell.style.color='#006b5b'; break;
      case 'B': gradeCell.style.color='#007fa3'; break;
      case 'C': gradeCell.style.color='#b89300'; break;
      case 'D': gradeCell.style.color='darkorange'; break;
      case 'F': gradeCell.style.color='crimson'; break;
    }
  }

  if (!logged || !logged.id || logged.role !== 'student') {
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="7">Please log in to view your results.</td></tr>';
    }
    return;
  }

  const fetchCall = window.API ?
    window.API.grades.getByStudent(logged.id) :
    fetch(`http://127.0.0.1:8000/grades/student/${logged.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch grades');
        return res.json();
      });

  fetchCall.then(data => {
      if (!tableBody) return;
      const rows = Array.isArray(data) ? data : [];
      tableBody.innerHTML = '';

      if (rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No grades available yet.</td></tr>';
        return;
      }

      let totalPoints = 0, subjects = 0;

      rows.forEach((g, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${g.course_id}</td>
          <td>${g.quiz_marks ?? 0}</td>
          <td>${g.mid_marks ?? 0}</td>
          <td>${g.assignment_marks ?? 0}</td>
          <td>${g.final_marks ?? 0}</td>
          <td>${g.marks_obtained ?? 0}</td>
          <td class="grade">${g.grade ?? 'N/A'}</td>
        `;
        tableBody.appendChild(tr);
        styleRow(tr, g.grade);
        tr.style.opacity = '0'; tr.style.transform = 'translateY(10px)';
        setTimeout(() => { tr.style.transition='0.4s ease'; tr.style.opacity='1'; tr.style.transform='translateY(0)'; }, index*100);

        if (g.grade && gradePoints[g.grade] !== undefined){ totalPoints += gradePoints[g.grade]; subjects++; }
      });

      const gpaDisplay = document.querySelector('#gpaDisplay');
      if (gpaDisplay && subjects>0){ gpaDisplay.textContent = `Your GPA: ${(totalPoints/subjects).toFixed(2)}`; }
    })
    .catch(err => {
      console.error('Failed to load grades', err);
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7">Failed to load grades. Please try again later.</td></tr>';
      }
    });
});
