/* =======================================================
   EDU Track - Dashboard Script (dashboard.js)
   Handles sidebar interactivity and user session control.
   ======================================================= */

// Show logged-in user's name (if available)
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const header = document.querySelector(".dashboard-header");

  if (user && header) {
    const subText = document.createElement("p");
    subText.textContent = `Logged in as: ${user.name} (${user.roll || "Student"})`;
    subText.style.color = "rgba(11,11,11,0.6)";
    subText.style.fontSize = "0.9rem";
    header.appendChild(subText);
  }
});

// Logout function (called by button)
function logout() {
  localStorage.removeItem("loggedInUser");
  alert("You have been logged out.");
  // Redirect to the login page relative to dashboard pages
  window.location.href = "../login.html";
}

// Active link highlight
const navLinks = document.querySelectorAll(".nav-links a");
if (navLinks && navLinks.length) {
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && window.location.href.includes(href)) {
      link.classList.add("active");
    }
  });
}
