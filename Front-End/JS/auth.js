/* =======================================================
   EDU Track - Authentication Script (auth.js)
   Handles login, signup, and basic form validation.
   ======================================================= */

// DOM references (match HTML forms in Front-End/HTML/pages)
const loginForm = document.querySelector("#loginForm") || document.querySelector(".auth-form");
const signupForm = document.querySelector("#registerForm") || document.querySelector("form[novalidate]");

// Simulated database (for demo only)
const users = JSON.parse(localStorage.getItem("users")) || [];

// Utility to show alerts nicely
function showAlert(message) {
  alert(message);
}

// ---- SIGNUP HANDLER ----
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = signupForm.fullname.value.trim();
    const email = (signupForm.email && signupForm.email.value) ? signupForm.email.value.trim() : '';
    const roll = signupForm.roll.value.trim();
    const password = signupForm.password.value.trim();
    const confirm = signupForm.confirm.value.trim();

    // Require university email (e.g. rollno@city.nu.edu.pk) OR a .org email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(?:nu\.edu\.pk)$/i;
    if (!email || !emailRegex.test(email)) {
      showAlert("Please enter a valid university email (e.g. rollno@city.nu.edu.pk) or a .org email.");
      return;
    }

    if (!name || !roll || !password) {
      showAlert("All fields are required!");
      return;
    }

    if (password !== confirm) {
      showAlert("Passwords do not match!");
      return;
    }

    // Attempt to register via backend API
    const payload = {
      full_name: name,
      email: email,
      password: password,
      contact: roll
    };

    fetch('/students/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Registration failed');
      }
      return res.json();
    })
    .then((data) => {
      // After successful registration, automatically log the user in
      const loginPayload = { email: email, password: password };
      fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload)
      })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Auto-login failed');
        }
        return res.json();
      })
      .then(session => {
        // session contains { role, id, name }
        // augment session with email for future convenience
        session.email = email;
        // Save session
        localStorage.setItem('loggedInUser', JSON.stringify(session));
        showAlert(`Welcome, ${session.name}! Redirecting to your dashboard...`);
        if (session.role === 'student') window.location.href = '/pages/dashboard/dashboard_student.html';
        else if (session.role === 'faculty') window.location.href = '/pages/dashboard/dashboard_faculty.html';
        else if (session.role === 'admin') window.location.href = '/pages/dashboard/dashboard_admin.html';
        else window.location.href = '/';
      })
      .catch((err) => {
        console.error('Auto-login failed', err);
        showAlert('Account created. Please login manually.');
        window.location.href = 'login.html';
      });
    })
    .catch((err) => {
      console.error('Signup error', err);
      showAlert('Registration failed: ' + (err.message || 'server error'));
    });
  });
}

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
    const payload = { email: username, password };
    fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async res => {
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Login failed');
      }
      return res.json();
    })
    .then(data => {
      // Save minimal session info and include any stored avatar
      try {
        const avatar = localStorage.getItem(`userAvatar_${data.role}_${data.id}`);
        if (avatar) data.photo = avatar;
      } catch (e) { /* ignore */ }
      localStorage.setItem('loggedInUser', JSON.stringify(data));
      showAlert(`Welcome back, ${data.name}!`);
      if (data.role === 'student') window.location.href = '/pages/dashboard/dashboard_student.html';
      else if (data.role === 'faculty') window.location.href = '/pages/dashboard/dashboard_faculty.html';
      else if (data.role === 'admin') window.location.href = '/pages/dashboard/dashboard_admin.html';
      else window.location.href = '/';
    })
    .catch(err => {
      console.error('Login error', err);
      // Fallback to local cache (demo)
      const existingUser = users.find(
        (u) => (u.name === username || u.roll === username) && u.password === password
      );
      if (existingUser) {
        localStorage.setItem("loggedInUser", JSON.stringify(existingUser));
        showAlert(`Welcome back, ${existingUser.name}! (offline)`);
        window.location.href = "/pages/dashboard/dashboard_student.html";
      } else {
        showAlert("Invalid credentials. Please try again.");
      }
    });
  });
}
