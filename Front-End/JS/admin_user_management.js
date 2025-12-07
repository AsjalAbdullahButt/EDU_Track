// ============================================
// ADMIN USER MANAGEMENT - COMPLETE VERSION
// ============================================

let allUsers = { students: [], faculty: [], admin: [] };
let currentFilter = 'students';
let pendingDeleteAction = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================
function log(message, data) {
  console.log(`[UserManagement] ${message}`, data || '');
}

function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  // Set colors based on type
  let bgColor, iconHtml;
  switch(type) {
    case 'success':
      bgColor = '#10b981';
      iconHtml = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      break;
    case 'error':
      bgColor = '#ef4444';
      iconHtml = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      break;
    case 'warning':
      bgColor = '#f59e0b';
      iconHtml = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      break;
    default:
      bgColor = '#3b82f6';
      iconHtml = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }
  
  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  `;
  
  toast.innerHTML = `
    <div style="flex-shrink: 0;">${iconHtml}</div>
    <div style="flex: 1;">${message}</div>
    <button style="background: transparent; border: none; color: white; cursor: pointer; padding: 0; font-size: 20px; line-height: 1; opacity: 0.8;" onclick="this.parentElement.remove()">×</button>
  `;
  
  // Add hover effect
  toast.onmouseenter = () => {
    toast.style.transform = 'translateX(-5px)';
  };
  toast.onmouseleave = () => {
    toast.style.transform = 'translateX(0)';
  };
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
  
  // Log to console
  console.log(`[TOAST ${type.toUpperCase()}] ${message}`);
}

// Add animation styles
if (!document.getElementById('toastStyles')) {
  const style = document.createElement('style');
  style.id = 'toastStyles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

// Make showToast available globally
window.showToast = showToast;

// ============================================
// API CALLS
// ============================================
async function apiCall(url, options = {}) {
  try {
    log(`API Call: ${url}`, options);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    log(`API Response from ${url}:`, data);
    return data;
  } catch (error) {
    log(`API Error for ${url}:`, error);
    showToast(`Error: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================
// LOAD DATA
// ============================================
async function loadAllUsers() {
  log('Loading all users...');
  
  try {
    // Fetch all user types
    const [students, faculty, admins] = await Promise.all([
      apiCall('/students').catch(() => []),
      apiCall('/faculties').catch(() => []),
      apiCall('/admins').catch(() => [])
    ]);
    
    // Process students
    allUsers.students = (students || []).map(s => ({
      id: s.student_id,
      name: s.full_name,
      email: s.email,
      role: 'Student',
      verified: s.profile_verified === true || s.verification_status === 'verified',
      verification_status: s.verification_status || 'unverified',
      department: s.department,
      original: s
    }));
    
    // Process faculty
    allUsers.faculty = (faculty || []).map(f => ({
      id: f.faculty_id,
      name: f.name,
      email: f.email,
      role: 'Faculty',
      department: f.department,
      contact: f.contact,
      original: f
    }));
    
    // Process admins
    allUsers.admin = (admins || []).map(a => ({
      id: a.admin_id,
      name: a.name,
      email: a.email,
      role: 'Admin',
      original: a
    }));
    
    log('Loaded users:', {
      students: allUsers.students.length,
      faculty: allUsers.faculty.length,
      admin: allUsers.admin.length
    });
    
    // Render current filter
    renderTable();
    
  } catch (error) {
    log('Error loading users:', error);
    showToast('Failed to load users', 'error');
  }
}

// ============================================
// RENDER TABLE
// ============================================
function renderTable() {
  const tbody = document.getElementById('userList');
  if (!tbody) {
    log('ERROR: userList tbody not found!');
    return;
  }
  
  const users = allUsers[currentFilter] || [];
  log(`Rendering ${users.length} ${currentFilter}`);
  
  // Update dynamic header
  const dynamicHeader = document.getElementById('dynamicHeader');
  if (dynamicHeader) {
    if (currentFilter === 'students') {
      dynamicHeader.textContent = 'Verification Status';
    } else if (currentFilter === 'faculty') {
      dynamicHeader.textContent = 'Department';
    } else {
      dynamicHeader.textContent = 'Status';
    }
  }
  
  // Clear table
  tbody.innerHTML = '';
  
  // Show empty state
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:40px; color:#999;">
          <div style="font-size:16px; font-weight:600;">No ${currentFilter} found</div>
          <div style="font-size:13px; margin-top:8px;">Click "+ Add New" to add a new user</div>
        </td>
      </tr>`;
    return;
  }
  
  // Render each user
  users.forEach(user => {
    const row = document.createElement('tr');
    
    // Status column based on user type
    let statusHtml = '';
    if (currentFilter === 'students') {
      if (user.verified) {
        statusHtml = '<span style="display:inline-flex; align-items:center; gap:6px; background:#10b981; color:white; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified</span>';
      } else {
        const status = user.verification_status || 'unverified';
        if (status === 'pending') {
          statusHtml = '<span style="display:inline-flex; align-items:center; gap:6px; background:#f59e0b; color:white; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Pending</span>';
        } else {
          statusHtml = '<span style="display:inline-flex; align-items:center; gap:6px; background:#ef4444; color:white; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Unverified</span>';
        }
      }
    } else if (currentFilter === 'faculty') {
      statusHtml = `<span style="color:#64748b; font-weight:500;">${user.department || 'N/A'}</span>`;
    } else {
      statusHtml = '<span style="color:#10b981; font-weight:600;">Active</span>';
    }
    
    // Action buttons with proper styling
    let actionsHtml = '<div style="display:flex; gap:6px; flex-wrap:wrap;">';
    
    // View button
    actionsHtml += `
      <button class="btn secondary" onclick="viewUser('${currentFilter}', ${user.id})" 
        style="padding:7px 14px; font-size:13px; font-weight:500; border-radius:6px; border:none; cursor:pointer; background:#64748b; color:white; transition:all 0.2s;"
        onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#64748b'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>View
      </button>`;
    
    // Edit button
    actionsHtml += `
      <button class="btn primary" onclick="editUser('${currentFilter}', ${user.id})" 
        style="padding:7px 14px; font-size:13px; font-weight:500; border-radius:6px; border:none; cursor:pointer; background:#2563eb; color:white; transition:all 0.2s;"
        onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>Edit
      </button>`;
    
    // Verify button (only for unverified students)
    if (currentFilter === 'students' && !user.verified) {
      actionsHtml += `
        <button class="btn success" onclick="verifyStudent(${user.id})" 
          style="padding:7px 14px; font-size:13px; font-weight:500; border-radius:6px; border:none; cursor:pointer; background:#10b981; color:white; transition:all 0.2s;"
          onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>Verify
        </button>`;
    }
    
    // Delete button
    actionsHtml += `
      <button class="btn danger" onclick="deleteUser('${currentFilter}', ${user.id}, '${user.name.replace(/'/g, "\\'")}\')" 
        style="padding:7px 14px; font-size:13px; font-weight:500; border-radius:6px; border:none; cursor:pointer; background:#ef4444; color:white; transition:all 0.2s;"
        onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>Delete
      </button>`;
    
    actionsHtml += '</div>';
    
    row.innerHTML = `
      <td style="font-weight:600; color:#334155;">${user.id}</td>
      <td style="font-weight:500; color:#0f172a;">${user.name}</td>
      <td style="color:#64748b;">${user.email}</td>
      <td><span style="background:#e0e7ff; color:#4338ca; padding:4px 10px; border-radius:4px; font-size:12px; font-weight:600;">${user.role}</span></td>
      <td>${statusHtml}</td>
      <td style="white-space:nowrap;">${actionsHtml}</td>
    `;
    
    tbody.appendChild(row);
  });
  
  log(`✓ Rendered ${users.length} rows successfully`);
}

// ============================================
// FILTER TABS
// ============================================
function switchTab(filter) {
  log(`→ Switching to tab: ${filter}`);
  currentFilter = filter;
  
  // Update tab buttons with active state
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const btnFilter = btn.getAttribute('data-filter');
    if (btnFilter === filter) {
      btn.classList.add('active');
      log(`  ✓ Activated tab: ${filter}`);
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show loading state briefly
  const tbody = document.getElementById('userList');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;"><div class="spinner" style="display:inline-block; width:20px; height:20px; border:3px solid #e2e8f0; border-top-color:#2563eb; border-radius:50%; animation:spin 0.8s linear infinite;"></div> Loading...</td></tr>';
  }
  
  // Render table after brief delay for smooth transition
  setTimeout(() => {
    renderTable();
  }, 100);
}

// ============================================
// VIEW USER
// ============================================
function viewUser(filter, id) {
  const user = allUsers[filter].find(u => u.id === id);
  if (!user) return;
  
  const modal = document.getElementById('viewUserModal');
  const details = document.getElementById('viewUserDetails');
  
  if (details) {
    details.textContent = JSON.stringify(user.original, null, 2);
  }
  
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeViewModal() {
  const modal = document.getElementById('viewUserModal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ============================================
// EDIT USER
// ============================================
function editUser(filter, id) {
  const user = allUsers[filter].find(u => u.id === id);
  if (!user) return;
  
  const modal = document.getElementById('editUserModal');
  document.getElementById('editUserFilter').value = filter;
  document.getElementById('editUserId').value = id;
  document.getElementById('editName').value = user.name;
  document.getElementById('editEmail').value = user.email;
  document.getElementById('editPassword').value = '';
  
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeEditModal() {
  const modal = document.getElementById('editUserModal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
}

async function saveEdit() {
  const filter = document.getElementById('editUserFilter').value;
  const id = parseInt(document.getElementById('editUserId').value);
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value.trim();
  
  if (!name || !email) {
    showToast('⚠️ Name and email are required', 'warning');
    return;
  }
  
  const user = allUsers[filter].find(u => u.id === id);
  if (!user) return;
  
  try {
    let endpoint = '';
    let payload = {};
    
    if (filter === 'students') {
      endpoint = `/students/${id}`;
      payload = {
        ...user.original,
        full_name: name,
        email: email,
        password: password || user.original.password
      };
    } else if (filter === 'faculty') {
      endpoint = `/faculties/${id}`;
      payload = {
        ...user.original,
        name: name,
        email: email,
        password: password || user.original.password
      };
    } else if (filter === 'admin') {
      endpoint = `/admins/${id}`;
      payload = {
        name: name,
        email: email,
        password: password || user.original.password,
        role: 'admin'
      };
    }
    
    await apiCall(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    showToast(`✅ ${name} has been updated successfully!`, 'success');
    log(`✓ User updated: ${name} (${filter})`, 'success');
    closeEditModal();
    loadAllUsers();
    
  } catch (error) {
    showToast(`❌ Failed to update user: ${error.message}`, 'error');
    log(`✗ Update failed: ${error.message}`, 'error');
  }
}

// ============================================
// VERIFY STUDENT
// ============================================
async function verifyStudent(studentId) {
  const student = allUsers.students.find(s => s.id === studentId);
  if (!student) return;
  
  const modal = document.getElementById('verifyStudentModal');
  document.getElementById('verifyStudentName').textContent = student.name;
  document.getElementById('verifyStudentEmail').textContent = student.email;
  document.getElementById('verifyStudentDept').textContent = student.department || 'N/A';
  document.getElementById('verifyStudentStatus').textContent = student.verification_status;
  
  // Set up confirm button
  document.getElementById('confirmVerifyBtn').onclick = async () => {
    try {
      await apiCall(`/admins/verify-profile/${studentId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ approve: true })
      });
      
      showToast(`✅ ${student.name} has been verified successfully!`, 'success');
      log(`✓ Student verified: ${student.name} (ID: ${studentId})`, 'success');
      closeVerifyModal();
      loadAllUsers();
      
    } catch (error) {
      showToast(`❌ Failed to verify student: ${error.message}`, 'error');
      log(`✗ Verification failed: ${error.message}`, 'error');
    }
  };
  
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeVerifyModal() {
  const modal = document.getElementById('verifyStudentModal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ============================================
// DELETE USER
// ============================================
function deleteUser(filter, id, name) {
  pendingDeleteAction = { filter, id };
  
  const modal = document.getElementById('confirmModal');
  const msg = document.getElementById('confirmMessage');
  
  if (msg) {
    msg.textContent = `Are you sure you want to delete ${name}? This action cannot be undone.`;
  }
  
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
  pendingDeleteAction = null;
}

async function confirmDelete() {
  if (!pendingDeleteAction) return;
  
  const { filter, id } = pendingDeleteAction;
  closeConfirmModal();
  
  try {
    let endpoint = '';
    let userName = '';
    const user = allUsers[filter].find(u => u.id === id);
    if (user) userName = user.name;
    
    if (filter === 'students') endpoint = `/students/${id}`;
    else if (filter === 'faculty') endpoint = `/faculties/${id}`;
    else if (filter === 'admin') endpoint = `/admins/${id}`;
    
    await fetch(endpoint, { method: 'DELETE' });
    showToast(`🗑️ ${userName || 'User'} has been deleted successfully!`, 'success');
    log(`✓ User deleted: ${userName} (${filter})`, 'success');
    loadAllUsers();
    
  } catch (error) {
    showToast(`❌ Failed to delete user: ${error.message}`, 'error');
    log(`✗ Deletion failed: ${error.message}`, 'error');
  }
}

// ============================================
// ADD USER
// ============================================
function openAddModal() {
  const modal = document.getElementById('addUserModal');
  const form = document.getElementById('addUserForm');
  
  if (form) {
    form.reset();
  }
  
  updateAddFormFields();
  
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeAddModal() {
  const modal = document.getElementById('addUserModal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
}

function updateAddFormFields() {
  const userType = document.getElementById('addUserType')?.value || '';
  
  // Hide all optional fields
  document.querySelectorAll('.student-field, .faculty-field').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show relevant fields
  if (userType === 'students') {
    document.querySelectorAll('.student-field').forEach(el => {
      el.style.display = 'block';
    });
  } else if (userType === 'faculty') {
    document.querySelectorAll('.faculty-field').forEach(el => {
      el.style.display = 'block';
    });
  }
}

async function saveAddUser() {
  const userType = document.getElementById('addUserType')?.value;
  const name = document.getElementById('addName')?.value.trim();
  const email = document.getElementById('addEmail')?.value.trim();
  const password = document.getElementById('addPassword')?.value.trim();
  
  if (!userType || !name || !email || !password) {
    showToast('⚠️ Please fill all required fields (Name, Email, Password)', 'warning');
    return;
  }
  
  try {
    let endpoint = '';
    let payload = {};
    
    if (userType === 'students') {
      endpoint = '/students';
      payload = {
        full_name: name,
        email: email,
        password: password,
        username: document.getElementById('addUsername')?.value.trim() || null,
        gender: document.getElementById('addGender')?.value || null,
        dob: document.getElementById('addDOB')?.value || null,
        department: document.getElementById('addDepartment')?.value.trim() || null,
        semester: parseInt(document.getElementById('addSemester')?.value) || null,
        contact: document.getElementById('addContact')?.value.trim() || null,
        address: document.getElementById('addAddress')?.value.trim() || null,
        role: 'student'
      };
    } else if (userType === 'faculty') {
      endpoint = '/faculties';
      payload = {
        name: name,
        email: email,
        password: password,
        department: document.getElementById('addDepartment')?.value.trim() || null,
        contact: document.getElementById('addContact')?.value.trim() || null,
        role: 'faculty'
      };
    } else if (userType === 'admin') {
      endpoint = '/admins';
      payload = {
        name: name,
        email: email,
        password: password,
        role: 'admin'
      };
    }
    
    await apiCall(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const userTypeLabel = userType === 'students' ? 'Student' : userType === 'faculty' ? 'Faculty' : 'Admin';
    showToast(`✅ ${userTypeLabel} "${name}" has been added successfully!`, 'success');
    log(`✓ New ${userTypeLabel} added: ${name} (${email})`, 'success');
    closeAddModal();
    loadAllUsers();
    switchTab(userType);
    
  } catch (error) {
    showToast(`❌ Failed to add user: ${error.message}`, 'error');
    log(`✗ Add user failed: ${error.message}`, 'error');
  }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  log('═══════════════════════════════════════');
  log('🚀 Initializing User Management System');
  log('═══════════════════════════════════════');
  
  // Add spinner animation to page
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Setup tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  log(`Found ${tabButtons.length} tab buttons`);
  
  tabButtons.forEach(btn => {
    const filter = btn.getAttribute('data-filter');
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      switchTab(filter);
    });
    log(`  ✓ Attached listener to: ${filter} tab`);
  });
  
  // Setup add button
  const addBtn = document.getElementById('addUserBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openAddModal();
    });
    log('✓ Add button listener attached');
  }
  
  // Setup save edit button
  const saveEditBtn = document.getElementById('saveEditBtn');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveEdit);
    log('✓ Save edit button listener attached');
  }
  
  // Setup save add button
  const saveAddBtn = document.getElementById('saveAddBtn');
  if (saveAddBtn) {
    saveAddBtn.addEventListener('click', saveAddUser);
    log('✓ Save add button listener attached');
  }
  
  // Setup add user type change
  const addUserType = document.getElementById('addUserType');
  if (addUserType) {
    addUserType.addEventListener('change', updateAddFormFields);
    log('✓ User type selector listener attached');
  }
  
  // Load initial data
  log('📡 Starting initial data load...');
  loadAllUsers();
  
  // Auto-refresh every 30 seconds
  setInterval(() => {
    log('🔄 Auto-refreshing user data...');
    loadAllUsers();
  }, 30000);
  
  log('═══════════════════════════════════════');
  log('✅ Initialization Complete!');
  log('═══════════════════════════════════════');
});

// Expose functions to window for onclick handlers
window.switchTab = switchTab;
window.viewUser = viewUser;
window.closeViewModal = closeViewModal;
window.editUser = editUser;
window.closeEditModal = closeEditModal;
window.verifyStudent = verifyStudent;
window.closeVerifyModal = closeVerifyModal;
window.deleteUser = deleteUser;
window.closeConfirmModal = closeConfirmModal;
window.confirmAction = confirmDelete;
window.openAddUserModal = openAddModal;
window.closeAddUserModal = closeAddModal;
window.updateAddFormFields = updateAddFormFields;
