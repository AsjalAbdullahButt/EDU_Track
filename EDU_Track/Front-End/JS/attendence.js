/* =======================================================
   EDU Track - Attendance Script (attendance.js)
   Animates circular attendance indicators
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle-progress");

  circles.forEach((circle) => {
    const value = parseInt(circle.dataset.value);
    let progress = 0;

    const interval = setInterval(() => {
      progress++;
      circle.style.background = `conic-gradient(var(--pastel-mint) ${progress * 3.6}deg, rgba(11,11,11,0.1) 0)`;
      circle.setAttribute("data-value", progress);
      if (progress >= value) clearInterval(interval);
    }, 20);
  });
});
