/* ============================================================
   EDU Track - Student Notifications Page
   ============================================================ */

async function fetchJson(path, opts = {}) {
  try {
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates) {
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        console.debug('[fetchJson] candidate failed', url, e.message);
      }
    }
  } catch (e) {
    try {
      const base2 = 'http://127.0.0.1:8000';
      const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
      for (const p of candidates2) {
        const fallback = base2 + p;
        try {
          const res2 = await fetch(fallback, opts);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {
          console.debug('[fetchJson] fallback failed', fallback, e2.message);
        }
      }
    } catch (e2) {
      console.error('[notifications] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadNotifications() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch all notifications
  const notificationsRes = await fetchJson(`/notifications`);
  const notifications = (notificationsRes || []).filter(n => n.student_id === studentId || !n.student_id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Render notifications
  const container = document.getElementById('notificationsContainer');
  if (!container) return;

  if (notifications.length === 0) {
    container.innerHTML = '<p class="empty-state">No notifications</p>';
    return;
  }

  container.innerHTML = notifications.map(n => {
    const createdDate = new Date(n.created_at);
    const formattedDate = createdDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `
    <div class="notification-item ${n.is_read ? 'read' : 'unread'}">
      <div class="notification-header">
        <h4>${n.title || 'Notification'}</h4>
        <small>${formattedDate}</small>
      </div>
      <div class="notification-body">
        <p>${n.message || ''}</p>
      </div>
      ${!n.is_read ? `<button class="btn-small" onclick="markAsRead(${n.notification_id})">Mark as Read</button>` : ''}
    </div>
    `;
  }).join('');
}

async function markAsRead(notificationId) {
  const result = await fetchJson(`/notifications/${notificationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_read: true })
  });

  if (result) {
    if (window.showToast) window.showToast('Notification marked as read', 'success');
    loadNotifications();
  }
}

// Auto-refresh every 20 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadNotifications();
  }, 20000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadNotifications();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
