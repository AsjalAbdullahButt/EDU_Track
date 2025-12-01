// Admin User Management - Dynamic data loading with filter tabs
// Fetches students, faculty, and admins from backend with no hardcoding

let allUsers = { students: [], faculty: [], admin: [] };
let currentFilter = 'students';
let pendingAction = null;
let userListRefreshInterval = null;

async function fetchJson(path, opts = {}){
  try{
    const res = await fetch(path, opts);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  }catch(e){
    console.error('fetchJson error', path, e);
    if (window.showToast) window.showToast('Failed to load: ' + path, 'error');
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
    fetchJson('/faculty'),
    fetchJson('/admins', { headers: adminHeaders })
  ]);

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
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">No ${filter} found</td></tr>`;
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

function editUser(filter, id){
  const user = allUsers[filter].find(u => u.id === id);
  if (!user) return;

  if (filter === 'students'){
    const newName = prompt('Update name:', user.name);
    if (newName === null) return;
    const newEmail = prompt('Update email:', user.email);
    if (newEmail === null) return;

    fetch(`/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: newName, email: newEmail })
    })
    .then(async res => {
      if (!res.ok) throw new Error('Update failed');
      if (window.showToast) window.showToast('Student updated', 'success');
      loadAllUsers();
    })
    .catch(err => {
      console.error(err);
      if (window.showToast) window.showToast('Failed to update student', 'error');
    });
  } else if (filter === 'faculty'){
    const newName = prompt('Update name:', user.name);
    if (newName === null) return;
    const newEmail = prompt('Update email:', user.email);
    if (newEmail === null) return;

    fetch(`/faculty/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail })
    })
    .then(async res => {
      if (!res.ok) throw new Error('Update failed');
      if (window.showToast) window.showToast('Faculty updated', 'success');
      loadAllUsers();
    })
    .catch(err => {
      console.error(err);
      if (window.showToast) window.showToast('Failed to update faculty', 'error');
    });
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
  else if (filter === 'faculty') endpoint = `/faculty/${id}`;
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
