/* =======================================================
   EDU Track - Attendance Script (attendance.js)
   Animates circular attendance indicators
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle-progress");

  // Attempt to compute attendance percentage from backend records
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  fetch('/attendance')
    .then(res => res.json())
    .then(rows => {
      let studentRows = rows;
      if (logged && logged.role === 'student') {
        studentRows = rows.filter(r => r.student_id === logged.id);
      }

      // compute percent present (status contains 'present' case-insensitive)
      const total = studentRows.length;
      const present = studentRows.filter(r => (r.status || '').toLowerCase().includes('present')).length;
      const percent = total > 0 ? Math.round((present / total) * 100) : 0;

      circles.forEach((circle) => {
        const value = percent;
        let progress = 0;
        const interval = setInterval(() => {
          progress++;
          circle.style.background = `conic-gradient(var(--pastel-mint) ${progress * 3.6}deg, rgba(11,11,11,0.1) 0)`;
          circle.setAttribute("data-value", progress);
          if (progress >= value) clearInterval(interval);
        }, 20);
      });
    })
    .catch(() => {
      // fallback: animate using dataset values already present
      circles.forEach((circle) => {
        const value = parseInt(circle.dataset.value) || 0;
        let progress = 0;
        const interval = setInterval(() => {
          progress++;
          circle.style.background = `conic-gradient(var(--pastel-mint) ${progress * 3.6}deg, rgba(11,11,11,0.1) 0)`;
          circle.setAttribute("data-value", progress);
          if (progress >= value) clearInterval(interval);
        }, 20);
      });
    });
});
