document.addEventListener('DOMContentLoaded', function(){
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (!session || !session.id) {
    // not logged in
    window.location.href = '/pages/login.html';
    return;
  }

  const userId = session.id;
  const profileForm = document.getElementById('profileForm');
  const cancelBtn = document.getElementById('cancelBtn');

  // Load existing profile data
  fetch(`/students/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error('Could not load profile');
      return res.json();
    })
    .then(data => {
      // Prefer server data, but fall back to session (useful right after registration)
      const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      document.getElementById('student_id').value = data.student_id || session.id || '';
      document.getElementById('full_name').value = data.full_name || session.name || '';
      document.getElementById('email').value = data.email || session.email || '';
      if (data.gender) document.getElementById('gender').value = data.gender;
      if (data.dob) document.getElementById('dob').value = data.dob;
      if (data.department) document.getElementById('department').value = data.department;
      if (data.contact) document.getElementById('contact').value = data.contact;
      if (data.address) document.getElementById('address').value = data.address;

      // Header/profile button is provided by dashboard.js; no insertion needed here.
      // Update verification badge (if present)
      const badge = document.getElementById('verificationStatus');
      if (badge) {
        const status = (data.verification_status || 'unverified').toLowerCase();
        badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        badge.className = 'status-badge status-' + status;
      }
    })
    .catch(err => {
      console.warn('Profile load failed, falling back to session', err);
      // If server call fails (e.g., newly registered user), populate from session
      const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      document.getElementById('student_id').value = session.id || '';
      document.getElementById('full_name').value = session.name || '';
      document.getElementById('email').value = session.email || '';
    });

  profileForm.addEventListener('submit', function(e){
    e.preventDefault();
    const payload = {
      gender: document.getElementById('gender').value || null,
      dob: document.getElementById('dob').value || null,
      department: document.getElementById('department').value || null,
      contact: document.getElementById('contact').value || null,
      address: document.getElementById('address').value || null
    };

    fetch(`/students/${userId}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to submit');
      }
      return res.json();
    })
    .then(data => {
      showAlert('Profile submitted for verification. An admin will verify your details shortly.', 'success');
      // Update local session copy if needed
      const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      session.name = data.full_name || session.name;
      localStorage.setItem('loggedInUser', JSON.stringify(session));
      // Optionally redirect or disable form
      profileForm.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = true);
    })
    .catch(err => {
      console.error(err);
      showAlert('Failed to submit profile: ' + (err.message || 'Server error'), 'error');
    });
  });

  cancelBtn && cancelBtn.addEventListener('click', function(){
    window.location.href = '/pages/dashboard/student/dashboard_student.html';
  });
});