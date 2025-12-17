/* =======================================================
   EDU Track - Authentication Script (auth.js)
   Handles login, signup, and basic form validation.
   ======================================================= */

// DOM references (match HTML forms in Front-End/HTML/pages)
const loginForm = document.querySelector("#loginForm") || document.querySelector(".auth-form");
const signupForm = document.querySelector("#registerForm") || document.querySelector("form[novalidate]");

// NOTE: auth now requires server-side validation; do NOT rely on local demo users

// Utility to show alerts nicely
function _createToastContainer(){
  let c = document.getElementById('globalToastContainer');
  if (c) return c;
  c = document.createElement('div');
  c.id = 'globalToastContainer';
  c.style.position = 'fixed';
  c.style.right = '18px';
  c.style.top = '18px';
  c.style.zIndex = 99999;
  c.style.display = 'flex';
  c.style.flexDirection = 'column';
  c.style.gap = '8px';
  document.body.appendChild(c);
  return c;
}

function showToast(message, type='info', timeout=4000){
  try{
    const container = _createToastContainer();
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.textContent = message;
    t.style.padding = '10px 14px';
    t.style.borderRadius = '8px';
    t.style.color = '#fff';
    t.style.minWidth = '200px';
    t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    t.style.fontSize = '14px';
    t.style.opacity = '0';
    if (type === 'success') t.style.background = '#27ae60';
    else if (type === 'error') t.style.background = '#e74c3c';
    else if (type === 'warning') t.style.background = '#f39c12';
    else t.style.background = '#34495e';
    container.appendChild(t);
    // fade in
    requestAnimationFrame(()=>{ t.style.transition = 'opacity 220ms ease, transform 220ms ease'; t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
    const to = setTimeout(()=>{
      t.style.opacity = '0';
      setTimeout(()=> t.remove(), 240);
    }, timeout);
    t.addEventListener('click', ()=>{ clearTimeout(to); t.remove(); });
  }catch(e){
    console.log(message);
  }
}

// Backwards-compatible showAlert used throughout repo
function showAlert(message, type='info'){
  if (window.showToast) return window.showToast(message, type);
  return showToast(message, type);
}

// expose globally
window.showToast = showToast;
window.showAlert = showAlert;

// ---- SIGNUP HANDLER ----
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = signupForm.fullname.value.trim();
    const username = (signupForm.username && signupForm.username.value) ? signupForm.username.value.trim() : '';
    const email = (signupForm.email && signupForm.email.value) ? signupForm.email.value.trim() : '';
    const contact = (signupForm.contact && signupForm.contact.value) ? signupForm.contact.value.trim() : '';
    const password = signupForm.password.value.trim();
    const confirm = signupForm.confirm.value.trim();

    // Require university email (e.g. rollno@city.nu.edu.pk) OR a .org email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:nu\.edu\.pk)$/i;
    if (!email || !emailRegex.test(email)) {
      showAlert("Please enter a valid university email (e.g. rollno@city.nu.edu.pk) or a .org email.");
      return;
    }

    if (!name || !username || !email || !password) {
      showAlert("All required fields must be filled!");
      return;
    }

    if (password !== confirm) {
      showAlert("Passwords do not match!");
      return;
    }

    // Attempt to register via backend API
    const payload = {
      username: username,
      full_name: name,
      email: email,
      password: password,
      contact: contact || null
    };

    // Use API helper if available, otherwise fallback to fetch
    const apiCall = window.API ? 
      window.API.students.create(payload) : 
      fetch('http://127.0.0.1:8000/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Registration failed');
        }
        return res.json();
      });

    apiCall.then((data) => {
      // After successful registration, automatically log the user in
      const loginPayload = { username: username, password: password };
      const loginCall = window.API ?
        window.API.auth.login(loginPayload) :
        fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginPayload)
        }).then(async (res) => {
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Auto-login failed');
          }
          return res.json();
        });

      loginCall.then(session => {
        // session contains { role, id, name }
        // augment session with email for future convenience
        session.email = email;
        // Save session
        localStorage.setItem('loggedInUser', JSON.stringify(session));
        showAlert(`Welcome, ${session.name}! Redirecting to your dashboard...`, 'success');
        if (session.role === 'student') window.location.href = '/pages/dashboard/student/dashboard_student.html';
        else if (session.role === 'faculty') window.location.href = '/pages/dashboard/faculty/dashboard_faculty.html';
        else if (session.role === 'admin') window.location.href = '/pages/dashboard/admin/dashboard_admin.html';
        else window.location.href = '/';
      })
      .catch((err) => {
        console.error('Auto-login failed', err);
        showAlert('Account created. Please login manually.', 'warning');
        window.location.href = '/pages/login.html';
      });
    })
    .catch((err) => {
      console.error('Signup error', err);
      showAlert('Registration failed: ' + (err.message || 'server error'));
    });
  });
}

// ---- PASSWORD VISIBILITY TOGGLE (for register/login forms) ----
document.addEventListener('DOMContentLoaded', function() {
  const pw = document.getElementById('password');
  const confirmPw = document.getElementById('confirm');
  const toggle = document.getElementById('showPassword');
  
  if (!pw || !toggle) return;
  
  toggle.addEventListener('change', function(){
    const type = this.checked ? 'text' : 'password';
    pw.type = type;
    if (confirmPw) confirmPw.type = type;
  });
});
// ---- LOGIN HANDLER ----
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = (loginForm.username && loginForm.username.value)
      ? loginForm.username.value.trim()
      : (loginForm.querySelector('#username')?.value || '').trim();
    const password = (loginForm.password && loginForm.password.value)
      ? loginForm.password.value.trim()
      : (loginForm.querySelector('#password')?.value || '').trim();
    // Try server-side login first
    const payload = { username: username, password };
    
    const loginCall = window.API ?
      window.API.auth.login(payload) :
      fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async res => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Login failed');
        }
        return res.json();
      });

    loginCall.then(data => {
      // Save minimal session info and include any stored avatar
      try {
        const avatar = localStorage.getItem(`userAvatar_${data.role}_${data.id}`);
        if (avatar) data.photo = avatar;
      } catch (e) { /* ignore */ }
      localStorage.setItem('loggedInUser', JSON.stringify(data));
      showAlert(`Welcome back, ${data.name}!`, 'success');
      if (data.role === 'student') window.location.href = '/pages/dashboard/student/dashboard_student.html';
      else if (data.role === 'faculty') window.location.href = '/pages/dashboard/faculty/dashboard_faculty.html';
      else if (data.role === 'admin') window.location.href = '/pages/dashboard/admin/dashboard_admin.html';
      else window.location.href = '/';
    })
    .catch(err => {
      console.error('Login error', err);
      // Do not fallback to local demo cache — require server auth
      showAlert("Invalid credentials or server unreachable. Please try again.", 'error');
    });
  });
}
