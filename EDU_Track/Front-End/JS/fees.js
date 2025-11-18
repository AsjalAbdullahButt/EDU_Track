/* =======================================================
   EDU Track - Fees Script (fees.js)
   Highlights pending fees and handles receipt button clicks
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".data-table tbody tr");

  rows.forEach((row) => {
    const statusCell = row.querySelector(".fee-status");
    const button = row.querySelector(".btn-view");

    // Highlight pending status
    if (statusCell && statusCell.textContent.includes("Pending")) {
      statusCell.style.color = "crimson";
      statusCell.style.fontWeight = "600";
      row.style.transition = "0.3s ease";
      row.addEventListener("mouseenter", () => (row.style.background = "rgba(255,0,0,0.05)"));
      row.addEventListener("mouseleave", () => (row.style.background = "transparent"));
    }

    // Handle receipt viewing
    if (button) {
      button.addEventListener("click", () => {
        alert("Your receipt is being downloaded (demo).");
      });
    }
  });
});
