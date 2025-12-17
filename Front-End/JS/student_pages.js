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
  if (logged && logged.role === 'student' && logged.id) {
    const fetchCall = window.API ?
      window.API.notifications.getByStudent(logged.id) :
      fetch(`http://127.0.0.1:8000/notifications/student/${logged.id}`)
        .then(res => {
          if (!res.ok) throw new Error('network');
          return res.json();
        });

    fetchCall.then(data => {
        const rows = Array.isArray(data) ? data : [];
        notifContainer.innerHTML = '';
        if (rows.length === 0) {
          const li = document.createElement('li');
          li.textContent = 'No notifications at this time.';
          notifContainer.appendChild(li);
        } else {
          rows.forEach(n => {
            const li = document.createElement('li');
            li.className = n.is_read ? 'read' : 'unread';
            li.textContent = `${n.title || 'Notification'}: ${n.message || ''}`;
            if (n.created_at) {
              const time = document.createElement('span');
              time.className = 'notification-time';
              time.textContent = new Date(n.created_at).toLocaleString();
              li.prepend(time);
            }
            notifContainer.appendChild(li);
          });
          
          const markReadCall = window.API ?
            window.API.notifications.markAsRead(logged.id) :
            fetch(`http://127.0.0.1:8000/notifications/student/${logged.id}/mark-read`, { method: 'POST' });
          
          markReadCall.catch(err => console.warn('Failed to mark notifications as read', err));
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
}
