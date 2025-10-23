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
    const roll = signupForm.roll.value.trim();
    const password = signupForm.password.value.trim();
    const confirm = signupForm.confirm.value.trim();

    if (!name || !roll || !password) {
      showAlert("All fields are required!");
      return;
    }

    if (password !== confirm) {
      showAlert("Passwords do not match!");
      return;
    }

    // Save user in localStorage (for demo)
    users.push({ name, roll, password });
    localStorage.setItem("users", JSON.stringify(users));

    showAlert("Account created successfully! Redirecting to login...");
    // redirect to login page that exists in pages folder
    window.location.href = "login.html";
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

    const existingUser = users.find(
      (u) => (u.name === username || u.roll === username) && u.password === password
    );

    if (existingUser) {
      localStorage.setItem("loggedInUser", JSON.stringify(existingUser));
      showAlert(`Welcome back, ${existingUser.name}!`);
      // Dashboard file path relative to the current page (pages/login.html)
      window.location.href = "dashboard/student/dashboard_student.html";
    } else {
      showAlert("Invalid credentials. Please try again.");
    }
  });
}
