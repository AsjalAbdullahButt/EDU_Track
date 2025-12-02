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

const notifContainer = document.querySelector(".notification-list");
if (notifContainer) {
  notifContainer.innerHTML = "";
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  fetch('/notifications')
    .then(res => {
      if (!res.ok) throw new Error('network');
      return res.json();
    })
    .then(data => {
      let rows = Array.isArray(data) ? data : [];
      if (logged && logged.role === 'student') rows = rows.filter(n => n.recipient_id === logged.id);
      notifContainer.innerHTML = '';
      if (rows.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No notifications at this time.';
        notifContainer.appendChild(li);
      } else {
        rows.forEach(n => {
          const li = document.createElement('li');
          li.textContent = `${n.date_sent ? new Date(n.date_sent).toLocaleString() : ''} — ${n.message || ''}`;
          notifContainer.appendChild(li);
        });
      }
    })
    .catch((err) => {
      console.warn('Failed to load notifications', err);
      notifContainer.innerHTML = '';
      const li = document.createElement('li');
      li.textContent = 'Unable to load notifications.';
      notifContainer.appendChild(li);
    });
}
