/* Faculty Announcements JS */
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
      } catch (e) {}
    }
  } catch (e) {
    try {
      const base2 = 'http://127.0.0.1:8000';
      for (const p of [path, path.endsWith('/') ? path : path + '/']) {
        try {
          const res2 = await fetch(base2 + p);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {}
      }
    } catch (e2) {}
  }
  return null;
}

async function loadAnnouncements() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const facultyId = session.id;

  const notificationsRes = await fetchJson('/notifications');
  const announcements = (notificationsRes || []).filter(n => n.faculty_id === facultyId || !n.faculty_id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const container = document.getElementById('announcementsContainer');
  if (!container) return;

  if (announcements.length === 0) {
    container.innerHTML = '<p class="empty-state">No announcements</p>';
    return;
  }

  container.innerHTML = announcements.map(a => `
    <div class="announcement">
      <h4>${a.title}</h4>
      <p>${a.message}</p>
      <small>${new Date(a.created_at).toLocaleString()}</small>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  try { protectDashboard('faculty'); } catch (e) { }
  loadAnnouncements();
});
