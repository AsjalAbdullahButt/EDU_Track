/* =======================================================
   EDU Track - Session & Role Protection
   Protects dashboards from unauthorized access
   ======================================================= */

// Check if user is logged in and has required role
function protectDashboard(requiredRole) {
  const loggedInUser = localStorage.getItem('loggedInUser');
  
  if (!loggedInUser) {
    // Not logged in - redirect to login
    alert('Please login first');
    window.location.href = '/pages/login.html';
    return false;
  }
  
  try {
    const user = JSON.parse(loggedInUser);
    
    // Check if user has correct role
    if (user.role !== requiredRole) {
      alert(`Unauthorized access. This dashboard is for ${requiredRole}s only.`);
      // Redirect to their own dashboard
      if (user.role === 'student') window.location.href = '/pages/dashboard/student/dashboard_student.html';
      else if (user.role === 'faculty') window.location.href = '/pages/dashboard/faculty/dashboard_faculty.html';
      else if (user.role === 'admin') window.location.href = '/pages/dashboard/admin/dashboard_admin.html';
      else window.location.href = '/pages/login.html';
      return false;
    }
    
    // User is authorized - display their info
    displayUserInfo(user);
    return true;
  } catch (e) {
    console.error('Session error:', e);
    localStorage.removeItem('loggedInUser');
    window.location.href = '/pages/login.html';
    return false;
  }
}

// Display user info in header/dashboard
function displayUserInfo(user) {
  // Update user name in header if element exists
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }
  
  // Update user role if element exists
  const userRoleElement = document.getElementById('userRole');
  if (userRoleElement) {
    userRoleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }
  
  // Update user email if element exists
  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement) {
    userEmailElement.textContent = user.email || 'N/A';
  }
}

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('loggedInUser');
    alert('Logged out successfully');
    window.location.href = '/pages/login.html';
  }
}

// Get current logged-in user
function getCurrentUser() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    try {
      return JSON.parse(loggedInUser);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('loggedInUser') !== null;
}

// Add logout button to header dynamically
document.addEventListener('DOMContentLoaded', function() {
  const headerNav = document.querySelector('.nav-links');
  if (headerNav && isLoggedIn()) {
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.textContent = 'Logout';
    logoutBtn.onclick = function(e) {
      e.preventDefault();
      logout();
    };
    logoutBtn.style.color = '#e74c3c';
    logoutBtn.style.fontWeight = 'bold';
    headerNav.appendChild(logoutBtn);
  }
});

window.protectDashboard = protectDashboard;
window.displayUserInfo = displayUserInfo;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
