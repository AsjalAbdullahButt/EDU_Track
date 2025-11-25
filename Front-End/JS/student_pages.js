/* =======================================================
   EDU Track - Student Pages Script (student_pages.js)
   Animates attendance, manages notifications & dynamic data
   ======================================================= */

// Animate circular attendance on load
document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle-progress");

  circles.forEach(circle => {
    const value = parseInt(circle.dataset.value);
    let progress = 0;

    const animate = setInterval(() => {
      progress++;
      circle.style.background = `conic-gradient(var(--pastel-mint) ${progress * 3.6}deg, rgba(11,11,11,0.1) 0)`;
      circle.setAttribute("data-value", progress);
      if (progress >= value) clearInterval(animate);
    }, 15);
  });
});

// Simulated notifications (can later come from DB)
const notifications = [
  "Your AI assignment has been graded.",
  "Next Software Engineering class rescheduled to 2 PM.",
  "Fee reminder: Due by 25th Oct 2025.",
];

const notifContainer = document.querySelector(".notification-list");
if (notifContainer) {
  notifContainer.innerHTML = "";
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  fetch('/notifications')
    .then(res => res.json())
    .then(data => {
      let rows = data;
      if (logged && logged.role === 'student') rows = data.filter(n => n.recipient_id === logged.id);
      notifContainer.innerHTML = '';
      rows.forEach(n => {
        const li = document.createElement('li');
        li.textContent = `${new Date(n.date_sent).toLocaleString()} — ${n.message}`;
        notifContainer.appendChild(li);
      });
    })
    .catch(() => {
      // fallback to static demo messages
      const notifications = [
        "Your AI assignment has been graded.",
        "Next Software Engineering class rescheduled to 2 PM.",
        "Fee reminder: Due by 25th Oct 2025.",
      ];
      notifContainer.innerHTML = '';
      notifications.forEach((msg) => {
        const li = document.createElement('li');
        li.textContent = msg;
        notifContainer.appendChild(li);
      });
    });
}
