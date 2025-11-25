document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.notification-list');
  if (!list) return;
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  fetch('/notifications')
    .then(res => res.json())
    .then(data => {
      // If logged in as student, filter recipient_id
      let rows = data;
      if (logged && logged.role === 'student') rows = data.filter(n => n.recipient_id === logged.id);
      list.innerHTML = '';
      rows.forEach(n => {
        const li = document.createElement('li');
        li.textContent = `${new Date(n.date_sent).toLocaleString()} — ${n.message}`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Failed to fetch notifications', err);
      // leave any static notifications in place
    });
});
