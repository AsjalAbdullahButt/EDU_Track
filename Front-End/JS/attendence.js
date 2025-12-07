/* =======================================================
   EDU Track - Attendance Script (attendance.js)
   Animates circular attendance indicators
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle-progress");

  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  
  if (logged && logged.role === 'student' && logged.id) {
    fetch(`/attendance/student/${logged.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch attendance');
        return res.json();
      })
      .then(studentRows => {
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

        const percentDisplay = document.getElementById('attendancePercent');
        if (percentDisplay) percentDisplay.textContent = percent + '%';
      })
      .catch((err) => {
        console.error('Failed to load attendance:', err);
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
  } else {
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
  }
});
