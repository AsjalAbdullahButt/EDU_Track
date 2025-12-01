// Admin User Management - Dynamic data loading with filter tabs
// Fetches students, faculty, and admins from backend with no hardcoding

let allUsers = { students: [], faculty: [], admin: [] };
let currentFilter = 'students';
let pendingAction = null;
let userListRefreshInterval = null;

async function fetchJson(path, opts = {}){
  // Robust fetch helper: try relative URL, then fallback to localhost:8000 if needed.
  try{
    const base = window.API_BASE || '';
    // try candidates: path and path + '/'
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates){
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try{
        const res = await fetch(url, opts);
        if (!res.ok) {
          const text = await res.text().catch(()=>res.statusText || '');
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return await res.json();
      }catch(err){
        // try next candidate
        console.debug('[fetchJson] candidate failed', url, err.message || err);
      }
    }
    throw new Error('All candidates failed');
  }catch(e){
    // If we failed and path is relative, try explicit localhost fallback (common dev setup)
    if (!path.startsWith('http')){
      try{
        const base2 = 'http://127.0.0.1:8000';
        const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
        for (const p of candidates2){
          const fallback = base2 + p;
          try{
            const res2 = await fetch(fallback, opts);
            if (!res2.ok){
              const txt2 = await res2.text().catch(()=>res2.statusText || '');
              throw new Error(`HTTP ${res2.status}: ${txt2}`);
            }
            return await res2.json();
          }catch(e2){
            console.debug('[fetchJson] fallback candidate failed', fallback, e2.message || e2);
          }
        }
        throw new Error('Fallback candidates failed');
      }catch(e2){
        console.error('fetchJson failed (both attempts)', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path} (${e2.message || e.message})`, 'error');
        return null;
      }
    }
    console.error('fetchJson error', path, e);
    if (window.showToast) window.showToast(`Failed to load: ${path} (${e.message})`, 'error');
    return null;
  }
}

async function loadAllUsers(){
  const role = JSON.parse(localStorage.getItem('loggedInUser') || '{}').role || '';
  const adminHeaders = { 'Content-Type': 'application/json' };
  if (role) adminHeaders['x-user-role'] = role;

  // Fetch in parallel
  const [students, faculty, admins] = await Promise.all([
    fetchJson('/students'),
    fetchJson('/faculties'),
    fetchJson('/admins', { headers: adminHeaders })
  ]);

  // Diagnostic logs to help debug why records may not appear
  try{
    console.debug('[admin_user_management] fetched students:', Array.isArray(students) ? students.length : students);
    console.debug('[admin_user_management] fetched faculties:', Array.isArray(faculty) ? faculty.length : faculty);
    console.debug('[admin_user_management] fetched admins:', Array.isArray(admins) ? admins.length : admins);
  }catch(e){ console.warn('Debug log failed', e); }

  // Transform and store
  allUsers.students = Array.isArray(students) ? students.map(s => ({
    id: s.student_id,
    name: s.full_name,
    email: s.email,
    role: 'Student',
    original: s
  })) : [];

  allUsers.faculty = Array.isArray(faculty) ? faculty.map(f => ({
    id: f.faculty_id,
    name: f.name,
    email: f.email,
    role: 'Faculty',
    original: f
  })) : [];

  allUsers.admin = Array.isArray(admins) ? admins.map(a => ({
    id: a.admin_id,
    name: a.name,
    email: a.email,
    role: 'Admin',
    original: a
  })) : [];

  // Render current filter
  renderUsers(currentFilter);
}

function filterUsers(filter){
  currentFilter = filter;
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderUsers(filter);
}

function renderUsers(filter){
  const tbody = document.getElementById('userList');
  const users = allUsers[filter] || [];

  if (users.length === 0){
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;"><strong>No ${filter} found</strong><div style="font-size:12px; color:#666; margin-top:6px;">If you recently registered users, ensure the server is running and registrations were persisted.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button class="btn secondary" onclick="editUser('${filter}', ${user.id})">Edit</button>
        <button class="btn danger" onclick="confirmDelete('${filter}', ${user.id}, '${user.name}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function editUser(filter, id){
  const user = allUsers[filter].find(u => u.id === id);
  if (!user) return;

  if (filter === 'students'){
    const newName = prompt('Update name:', user.name);
    if (newName === null) return;
    const newEmail = prompt('Update email:', user.email);
    if (newEmail === null) return;

    // StudentCreate schema requires: full_name, email, password, and optional fields
    // Use original data as base to preserve other fields like password
    const payload = {
      full_name: newName,
      email: newEmail,
      password: user.original.password, // Keep existing password
      gender: user.original.gender || null,
      dob: user.original.dob || null,
      department: user.original.department || null,
      semester: user.original.semester || null,
      contact: user.original.contact || null,
      address: user.original.address || null,
      role: user.original.role || 'student'
    };

    const result = await fetchJson(`/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (result){
      if (window.showToast) window.showToast('Student updated successfully', 'success');
      loadAllUsers();
    } else {
      if (window.showToast) window.showToast('Failed to update student', 'error');
    }
  } else if (filter === 'faculty'){
    const newName = prompt('Update name:', user.name);
    if (newName === null) return;
    const newEmail = prompt('Update email:', user.email);
    if (newEmail === null) return;

    // FacultyCreate schema requires: name, email, password, and optional fields
    const payload = {
      name: newName,
      email: newEmail,
      password: user.original.password, // Keep existing password
      department: user.original.department || null,
      contact: user.original.contact || null,
      role: user.original.role || 'faculty'
    };

    const result = await fetchJson(`/faculties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (result){
      if (window.showToast) window.showToast('Faculty updated successfully', 'success');
      loadAllUsers();
    } else {
      if (window.showToast) window.showToast('Failed to update faculty', 'error');
    }
  } else if (filter === 'admin'){
    const newName = prompt('Update name:', user.name);
    if (newName === null) return;
    const newEmail = prompt('Update email:', user.email);
    if (newEmail === null) return;

    // AdminCreate schema requires: name, email, password
    const payload = {
      name: newName,
      email: newEmail,
      password: user.original.password, // Keep existing password
      role: user.original.role || 'admin'
    };

    const result = await fetchJson(`/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (result){
      if (window.showToast) window.showToast('Admin updated successfully', 'success');
      loadAllUsers();
    } else {
      if (window.showToast) window.showToast('Failed to update admin', 'error');
    }
  }
}

function confirmDelete(filter, id, name){
  pendingAction = { filter, id };
  const modal = document.getElementById('confirmModal');
  const msg = document.getElementById('confirmMessage');
  if (msg) msg.textContent = `Are you sure you want to delete ${name}? This action cannot be undone.`;
  if (modal) modal.setAttribute('aria-hidden', 'false');
}

function closeConfirmModal(){
  const modal = document.getElementById('confirmModal');
  if (modal) modal.setAttribute('aria-hidden', 'true');
  pendingAction = null;
}

function confirmAction(){
  if (!pendingAction) return;
  const { filter, id } = pendingAction;
  closeConfirmModal();

  let endpoint = '';
  if (filter === 'students') endpoint = `/students/${id}`;
  else if (filter === 'faculty') endpoint = `/faculties/${id}`;
  else if (filter === 'admin') endpoint = `/admins/${id}`;

  if (!endpoint) return;

  fetch(endpoint, { method: 'DELETE' })
    .then(async res => {
      if (!res.ok) throw new Error('Delete failed');
      if (window.showToast) window.showToast('User deleted successfully', 'success');
      loadAllUsers();
    })
    .catch(err => {
      console.error(err);
      if (window.showToast) window.showToast('Failed to delete user', 'error');
    });
}

// Auto-refresh user list every 8 seconds
function startUserListRefresh(intervalMs = 8000){
  if (userListRefreshInterval) clearInterval(userListRefreshInterval);
  userListRefreshInterval = setInterval(() => loadAllUsers(), intervalMs);
}

// Stop the refresh
function stopUserListRefresh(){
  if (userListRefreshInterval) clearInterval(userListRefreshInterval);
  userListRefreshInterval = null;
}

// Initialization
window.addEventListener('load', function(){
  try {
    protectDashboard && protectDashboard('admin');
  } catch(e){ /* ignore */ }
  loadAllUsers();
  startUserListRefresh(8000);
});

// Stop refresh when page is unloaded
window.addEventListener('beforeunload', stopUserListRefresh);

// Pause when tab hidden, resume when visible
document.addEventListener('visibilitychange', function(){
  if (document.hidden) stopUserListRefresh();
  else startUserListRefresh(8000);
});

// Expose functions to window
window.filterUsers = filterUsers;
window.editUser = editUser;
window.confirmDelete = confirmDelete;
window.closeConfirmModal = closeConfirmModal;
window.confirmAction = confirmAction;
window.loadAllUsers = loadAllUsers;
window.startUserListRefresh = startUserListRefresh;
window.stopUserListRefresh = stopUserListRefresh;
