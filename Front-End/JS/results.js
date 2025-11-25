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

  fetch('/grades')
    .then(res => res.json())
    .then(data => {
      if (!tableBody) return;
      let rows = data;
      if (logged && logged.role === 'student') rows = data.filter(g => g.student_id === logged.id);
      tableBody.innerHTML = '';

      let totalPoints = 0, subjects = 0;

      rows.forEach((g, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${g.course_id}</td>
          <td>${g.marks_obtained ?? ''}</td>
          <td class="grade">${g.grade ?? ''}</td>
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
    });
});
