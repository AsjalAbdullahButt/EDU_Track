/* =======================================================
   EDU Track - Main Dashboard Script (main.js)
   Handles dynamic greetings, dashboard card animations.
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const greet = document.querySelector("#dashboardGreeting");
  const statCards = document.querySelectorAll(".stat-card");

  // Dynamic Greeting
  const hour = new Date().getHours();
  let message = "Welcome Back";
  if (hour < 12) message = "Good Morning";
  else if (hour < 18) message = "Good Afternoon";
  else message = "Good Evening";

  if (greet && user) {
    greet.textContent = `${message}, ${user.name || "Student"}!`;
  }

  // Animate statistic cards
  statCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(15px)";
    setTimeout(() => {
      card.style.transition = "0.4s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 120);
  });
});
