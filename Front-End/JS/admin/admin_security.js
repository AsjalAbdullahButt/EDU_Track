// Admin Security page behavior (extracted from inline)
// Sample users
const users = [
  { id: 1, name: "Dr. John", role: "Admin", twoFA: true, status: "Active" },
  { id: 2, name: "Prof. Jane", role: "Instructor", twoFA: false, status: "Active" },
  { id: 3, name: "Alice", role: "Student", twoFA: false, status: "Locked" }
];

const logs = [
  "Dr. John enabled 2FA.",
  "Alice account was locked due to failed login attempts.",
  "Prof. Jane password reset by Admin."
];

function populateSecurityTable() {
  const tbody = document.getElementById('securityList');
  tbody.innerHTML = '';
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.role}</td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${user.twoFA ? 'checked' : ''} onchange="toggle2FA(${user.id}, this)">
          <span class="slider"></span>
        </label>
      </td>
      <td>${user.status}</td>
      <td>
        <button class="action-btn" onclick="editUser(${user.id})">Edit</button>
        <button class="action-btn" onclick="unlockUser(${user.id})">Unlock</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function populateLogs() {
  const logList = document.getElementById('securityLogs');
  logList.innerHTML = '';
  logs.forEach(log => {
    const li = document.createElement('li');
    li.textContent = log;
    logList.appendChild(li);
  });
}

function toggle2FA(id, checkbox) {
  showAlert(`2FA toggled for user ${id}`, 'info');
}

function editUser(id) {
  showAlert(`Edit user ${id}`, 'info');
}

function unlockUser(id) {
  showAlert(`Unlocked user ${id}`, 'success');
}

window.addEventListener('load', () => {
  populateSecurityTable();
  populateLogs();
});

window.toggle2FA = toggle2FA;
window.editUser = editUser;
window.unlockUser = unlockUser;
