document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("notificationPopup");
  const openBtn = document.getElementById("notifBtn");
  const closeBtn = document.getElementById("closeNotif");
  const list = document.getElementById("popupList");

  async function loadNotifications() {
    try {
      const res = await fetch('/notifications');
      const data = await res.json();
      const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
      let rows = data;
      if (logged && logged.role === 'student') rows = data.filter(n => n.recipient_id === logged.id);
      if (list) {
        list.innerHTML = rows.map(n => `<li>${new Date(n.date_sent).toLocaleString()} — ${n.message}</li>`).join('');
      }
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  }

  function togglePopup(show) {
    popup.style.display = show ? 'flex' : 'none';
  }

  function showToast(message, kind = 'info') {
    const toast = document.createElement('div');
    toast.className = `edu-toast edu-toast-${kind}`;
    toast.innerHTML = `<div class="toast-body">${message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 20);
    setTimeout(() => { toast.classList.remove('visible'); setTimeout(()=>toast.remove(),300); }, 4500);
  }

  async function createNotification(payload) {
    try {
      const res = await fetch('/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create notification');
      const data = await res.json();
      showToast(payload.message, 'success');
      if (popup.style.display === 'flex') await loadNotifications();
      return data;
    } catch (err) {
      console.warn('Notification POST failed, showing local toast', err);
      showToast(payload.message, 'info');
      return null;
    }
  }

  window.showToast = showToast;
  window.createNotification = createNotification;

  openBtn?.addEventListener('click', async () => {
    await loadNotifications();
    togglePopup(true);
  });

  closeBtn?.addEventListener('click', () => togglePopup(false));

  window.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && e.target !== openBtn) {
      togglePopup(false);
    }
  });
});