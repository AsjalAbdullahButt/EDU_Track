let allUsers = [];
let filteredUsers = [];
let securityRefreshInterval = null;
let currentPasswordResetUser = null;

// API Configuration
const API_BASE = 'http://127.0.0.1:8000';

// Fetch utility function
async function fetchJson(path, opts = {}){
  try{
    const base = window.API_BASE || API_BASE;
    const url = path.startsWith('http') ? path : base + path;
    
    const response = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
        ...opts.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch(error) {
    console.error('[fetchJson] Error:', path, error);
    return null;
  }
}

// Load all security data
async function loadSecurityData(){
  try {
    showLoading();
    
    const [studentsRes, facultyRes, adminsRes] = await Promise.all([
      fetchJson('/students'),
      fetchJson('/faculties'),
      fetchJson('/admins')
    ]);

    // Combine all users with role and normalized fields
    allUsers = [
      ...(studentsRes || []).map(s => ({
        ...s,
        user_id: s.student_id,
        role: 'student',
        name: s.full_name || s.name || 'Unknown',
        email: s.email || '',
        account_status: s.account_status || 'Active',
        twofa_enabled: s.twofa_enabled || false
      })),
      ...(facultyRes || []).map(f => ({
        ...f,
        user_id: f.faculty_id,
        role: 'faculty',
        name: f.name || f.full_name || f.faculty_name || 'Unknown',
        email: f.email || '',
        account_status: f.account_status || 'Active',
        twofa_enabled: f.twofa_enabled || false
      })),
      ...(adminsRes || []).map(a => ({
        ...a,
        user_id: a.admin_id,
        role: 'admin',
        name: a.name || a.full_name || 'Unknown',
        email: a.email || '',
        account_status: a.account_status || 'Active',
        twofa_enabled: a.twofa_enabled || false
      }))
    ];

    filteredUsers = [...allUsers];
    updateStatistics();
    renderSecurityTable();
    loadSecurityLogs();
    hideLoading();
  } catch(error) {
    console.error('Error loading security data:', error);
    showToast('Failed to load security data', 'error');
    hideLoading();
  }
}

// Update statistics cards
function updateStatistics(){
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.account_status === 'Active').length;
  const twoFAEnabled = allUsers.filter(u => u.twofa_enabled).length;
  const lockedUsers = allUsers.filter(u => u.account_status === 'Locked').length;

  document.getElementById('totalUsers').textContent = totalUsers;
  document.getElementById('activeUsers').textContent = activeUsers;
  document.getElementById('twoFAEnabled').textContent = twoFAEnabled;
  document.getElementById('lockedUsers').textContent = lockedUsers;
}

// Render the security table
function renderSecurityTable(){
  const tbody = document.getElementById('securityList');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4m0 4h.01"/>
            </svg>
            <h3>No users found</h3>
            <p>Try adjusting your filters</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach(user => {
    const row = document.createElement('tr');
    const status = user.account_status || 'Active';
    const twoFAEnabled = user.twofa_enabled || false;
    
    row.innerHTML = `
      <td data-label="User ID">${user.user_id}</td>
      <td data-label="Name">${user.name}</td>
      <td data-label="Email">${user.email}</td>
      <td data-label="Role"><span class="badge badge-${user.role}">${user.role}</span></td>
      <td data-label="2FA Status">
        <label class="toggle-switch">
          <input type="checkbox" ${twoFAEnabled ? 'checked' : ''} 
                 onchange="toggle2FA(${user.user_id}, '${user.role}', this)">
          <span class="slider"></span>
        </label>
      </td>
      <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
      <td data-label="Actions">
        <button class="btn btn-sm primary action-btn" onclick="openPasswordReset(${user.user_id}, '${user.name}', '${user.role}')">
          Reset Password
        </button>
        ${status === 'Locked' 
          ? `<button class="btn btn-sm btn-unlock" onclick="unlockUser(${user.user_id}, '${user.role}')">Unlock</button>`
          : `<button class="btn btn-sm btn-lock" onclick="lockUser(${user.user_id}, '${user.role}')">Lock</button>`
        }
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Load security activity logs
async function loadSecurityLogs(){
  const logContainer = document.getElementById('securityLogs');
  if (!logContainer) return;

  try {
    const notifications = await fetchJson('/notifications');
    
    if (!notifications || notifications.length === 0) {
      logContainer.innerHTML = '<div class="log-item"><div class="log-message">No recent security activity available.</div></div>';
      return;
    }

    logContainer.innerHTML = '';
    notifications.slice(0, 10).forEach(log => {
      const logItem = document.createElement('div');
      logItem.className = 'log-item';
      
      const date = log.date_sent || log.date || log.timestamp;
      const message = log.message || log.event || 'Security event';
      
      logItem.innerHTML = `
        <div class="log-date">${date ? new Date(date).toLocaleString() : 'Recent'}</div>
        <div class="log-message">${escapeHtml(message)}</div>
      `;
      
      logContainer.appendChild(logItem);
    });
  } catch(error) {
    console.warn('Failed to load security logs:', error);
    logContainer.innerHTML = '<div class="log-item"><div class="log-message">Unable to load security logs.</div></div>';
  }
}

// Filter users based on search and filters
function filterUsers(){
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const roleFilter = document.getElementById('roleFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;

  filteredUsers = allUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.user_id.toString().includes(searchTerm);
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.account_status.toLowerCase() === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  renderSecurityTable();
}

// Reset all filters
function resetFilters(){
  document.getElementById('searchInput').value = '';
  document.getElementById('roleFilter').value = '';
  document.getElementById('statusFilter').value = '';
  filterUsers();
}

// Toggle 2FA for a user
async function toggle2FA(userId, role, checkbox){
  const enabled = checkbox.checked;
  const originalState = !enabled;
  
  try {
    // Determine the correct endpoint based on role
    let endpoint;
    if (role === 'student') {
      endpoint = `${API_BASE}/students/${userId}`;
    } else if (role === 'faculty') {
      endpoint = `${API_BASE}/faculties/${userId}`;
    } else if (role === 'admin') {
      endpoint = `${API_BASE}/admins/${userId}`;
    } else {
      throw new Error(`Unknown role: ${role}`);
    }

    console.log(`Toggling 2FA for ${role} #${userId} to ${enabled}`);
    
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ twofa_enabled: enabled })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('2FA toggle response:', result);
      
      showToast(`2FA ${enabled ? 'enabled' : 'disabled'} for user #${userId}`, 'success');
      
      // Update local data
      const user = allUsers.find(u => u.user_id === userId && u.role === role);
      if (user) {
        user.twofa_enabled = enabled;
        updateStatistics();
        renderSecurityTable(); // Re-render to ensure consistency
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('2FA toggle failed:', response.status, errorData);
      throw new Error(errorData.detail || `Failed to update 2FA (HTTP ${response.status})`);
    }
  } catch(error) {
    console.error('2FA toggle error:', error);
    checkbox.checked = originalState; // Revert checkbox to original state
    showToast(`Failed to update 2FA: ${error.message}`, 'error');
  }
}

// Open password reset modal
function openPasswordReset(userId, userName, role){
  currentPasswordResetUser = { userId, userName, role };
  document.getElementById('resetUserName').textContent = userName;
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('passwordModal').style.display = 'block';
}

// Close password reset modal
function closePasswordModal(){
  document.getElementById('passwordModal').style.display = 'none';
  currentPasswordResetUser = null;
}

// Submit password reset
async function submitPasswordReset(){
  if (!currentPasswordResetUser) return;

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!newPassword || !confirmPassword) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    const { userId, role } = currentPasswordResetUser;
    
    // Note: This endpoint needs to be created in backend
    const response = await fetch(`${API_BASE}/${role}s/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ new_password: newPassword })
    });

    if (response.ok) {
      showToast('Password reset successfully', 'success');
      closePasswordModal();
      await loadSecurityData(); // Reload data
    } else {
      throw new Error('Failed to reset password');
    }
  } catch(error) {
    console.error('Password reset error:', error);
    showToast('Failed to reset password. This feature may not be available yet.', 'error');
  }
}

// Lock user account
async function lockUser(userId, role){
  if (!confirm('Are you sure you want to lock this user account?')) return;

  try {
    const response = await fetch(`${API_BASE}/${role}s/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ account_status: 'Locked' })
    });

    if (response.ok) {
      showToast(`User #${userId} account locked`, 'success');
      
      // Update local data
      const user = allUsers.find(u => u.user_id === userId && u.role === role);
      if (user) {
        user.account_status = 'Locked';
        updateStatistics();
        renderSecurityTable();
      }
    } else {
      throw new Error('Failed to lock user');
    }
  } catch(error) {
    console.error('Lock user error:', error);
    showToast('Failed to lock user account', 'error');
  }
}

// Unlock user account
async function unlockUser(userId, role){
  if (!confirm('Are you sure you want to unlock this user account?')) return;

  try {
    const response = await fetch(`${API_BASE}/${role}s/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin'
      },
      body: JSON.stringify({ account_status: 'Active' })
    });

    if (response.ok) {
      showToast(`User #${userId} account unlocked`, 'success');
      
      // Update local data
      const user = allUsers.find(u => u.user_id === userId && u.role === role);
      if (user) {
        user.account_status = 'Active';
        updateStatistics();
        renderSecurityTable();
      }
    } else {
      throw new Error('Failed to unlock user');
    }
  } catch(error) {
    console.error('Unlock user error:', error);
    showToast('Failed to unlock user account', 'error');
  }
}

// Refresh logs
async function refreshLogs(){
  showToast('Refreshing security logs...', 'info');
  await loadSecurityLogs();
}

// Auto-refresh functionality
function startSecurityRefresh(intervalMs = 30000){
  if (securityRefreshInterval) clearInterval(securityRefreshInterval);
  securityRefreshInterval = setInterval(() => loadSecurityData(), intervalMs);
}

function stopSecurityRefresh(){
  if (securityRefreshInterval) clearInterval(securityRefreshInterval);
  securityRefreshInterval = null;
}

// Utility functions
function showLoading(){
  const tbody = document.getElementById('securityList');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading security data</td></tr>';
  }
}

function hideLoading(){
  // Loading is hidden when table is rendered
}

function showToast(message, type = 'info'){
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[${type}] ${message}`);
  }
}

function escapeHtml(text){
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
  loadSecurityData();
  startSecurityRefresh(30000);

  // Add search on Enter key
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        filterUsers();
      } else {
        // Debounced search
        clearTimeout(searchInput.searchTimeout);
        searchInput.searchTimeout = setTimeout(filterUsers, 500);
      }
    });
  }

  // Close modal on outside click
  window.onclick = (event) => {
    const modal = document.getElementById('passwordModal');
    if (event.target === modal) {
      closePasswordModal();
    }
  };

  window.addEventListener('beforeunload', stopSecurityRefresh);
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSecurityRefresh();
    } else {
      startSecurityRefresh(30000);
    }
  });
});

// Export functions to global scope
window.filterUsers = filterUsers;
window.resetFilters = resetFilters;
window.toggle2FA = toggle2FA;
window.openPasswordReset = openPasswordReset;
window.closePasswordModal = closePasswordModal;
window.submitPasswordReset = submitPasswordReset;
window.lockUser = lockUser;
window.unlockUser = unlockUser;
window.refreshLogs = refreshLogs;

