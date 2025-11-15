/* =======================================================
   EDU Track - Courses Script (courses.js)
   Handles course card animations and details display
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".data-table tbody tr");

  rows.forEach((row, index) => {
    const btn = row.querySelector(".btn-details");
    row.style.opacity = "0";
    row.style.transform = "translateY(10px)";

    // Animate rows appearing
    setTimeout(() => {
      row.style.transition = "0.3s ease";
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, index * 100);

    // Button click handler
    if (btn) {
      btn.addEventListener("click", () => {
        const courseName = row.querySelector("td").textContent.trim();
        alert(`Opening details for ${courseName} (demo).`);
      });
    }
  });
});
