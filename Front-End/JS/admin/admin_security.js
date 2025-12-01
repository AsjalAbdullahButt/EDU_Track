let allUsers = [];
let securityRefreshInterval = null;

async function fetchJson(path, opts = {}){
  try{
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates){
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try{
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }catch(e){ console.debug('[fetchJson] candidate failed', url, e.message); }
    }
    throw new Error('All candidates failed');
  }catch(e){
    if (!path.startsWith('http')){
      try{
        const base2 = 'http://127.0.0.1:8000';
        const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
        for (const p of candidates2){
          const fallback = base2 + p;
          try{
            const res2 = await fetch(fallback, opts);
            if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
            return await res2.json();
          }catch(e2){ console.debug('[fetchJson] fallback failed', fallback, e2.message); }
        }
        throw new Error('Fallback candidates failed');
      }catch(e2){
        console.error('[admin_security] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[admin_security] fetchJson error', path, e);
    return null;
  }
}

async function loadSecurityData(){
  const [studentsRes, facultyRes, adminsRes] = await Promise.all([
    fetchJson('/students'),
    fetchJson('/faculties'),
    fetchJson('/admins')
  ]);

  // Combine all users with role
  allUsers = [
    ...(studentsRes || []).map(s => ({...s, user_id: s.student_id, role: 'student', name: s.full_name})),
    ...(facultyRes || []).map(f => ({...f, user_id: f.faculty_id, role: 'faculty', name: f.full_name})),
    ...(adminsRes || []).map(a => ({...a, user_id: a.admin_id, role: 'admin', name: a.full_name}))
  ];

  renderSecurityTable();
  loadSecurityLogs();
}

function renderSecurityTable(){
  const tbody = document.getElementById('securityList');
  if (!tbody) return;

  tbody.innerHTML = '';
  allUsers.forEach((user, idx) => {
    const row = document.createElement('tr');
    const status = user.account_status || 'Active';
    const twoFAEnabled = user.twofa_enabled || false;
    row.innerHTML = `
      <td data-label="User ID">${user.user_id}</td>
      <td data-label="Name">${user.name || '—'}</td>
      <td data-label="Role"><span class="badge badge-${user.role}">${user.role}</span></td>
      <td data-label="2FA Enabled">
        <label class="toggle-switch">
          <input type="checkbox" ${twoFAEnabled ? 'checked' : ''} onchange="toggle2FA(${user.user_id}, this)">
          <span class="slider"></span>
        </label>
      </td>
      <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
      <td data-label="Actions">
        <button class="btn btn-sm primary" onclick="editUser(${user.user_id}, '${user.role}')">Edit</button>
        ${status === 'Locked' ? `<button class="btn btn-sm secondary" onclick="unlockUser(${user.user_id})">Unlock</button>` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });

  if (allUsers.length === 0){
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No users found</td></tr>';
  }
}

async function loadSecurityLogs(){
  const logList = document.getElementById('securityLogs');
  if (!logList) return;

  // In a production system, fetch from /notifications or /audit-logs endpoint
  // For now, show placeholder
  logList.innerHTML = '<li style="color:#666;">Recent security activity will appear here</li>';
}

async function toggle2FA(userId, checkbox){
  try{
    // This would need backend endpoint like /admins/update-2fa or similar
    const enabled = checkbox.checked;
    window.showToast?.(`2FA ${enabled ? 'enabled' : 'disabled'} for user #${userId}`, 'info');
  }catch(e){
    console.error(e);
    window.showToast?.('Failed to update 2FA', 'error');
  }
}

async function editUser(userId, role){
  try{
    window.showToast?.(`Edit user #${userId} (${role})`, 'info');
    // Open modal or navigate to edit page
  }catch(e){
    console.error(e);
    window.showToast?.('Failed to edit user', 'error');
  }
}

async function unlockUser(userId){
  try{
    // Would need backend endpoint to unlock account
    window.showToast?.(`User #${userId} unlocked`, 'success');
    await loadSecurityData();
  }catch(e){
    console.error(e);
    window.showToast?.('Failed to unlock user', 'error');
  }
}

function startSecurityRefresh(intervalMs = 20000){
  if (securityRefreshInterval) clearInterval(securityRefreshInterval);
  securityRefreshInterval = setInterval(() => loadSecurityData(), intervalMs);
}

function stopSecurityRefresh(){
  if (securityRefreshInterval) clearInterval(securityRefreshInterval);
  securityRefreshInterval = null;
}

window.addEventListener('DOMContentLoaded', () => {
  loadSecurityData();
  startSecurityRefresh(20000);

  window.addEventListener('beforeunload', stopSecurityRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSecurityRefresh();
    else startSecurityRefresh(20000);
  });
});

window.toggle2FA = toggle2FA;
window.editUser = editUser;
window.unlockUser = unlockUser;
