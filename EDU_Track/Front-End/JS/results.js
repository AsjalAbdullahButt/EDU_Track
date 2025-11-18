/* =======================================================
   EDU Track - Results Script (results.js)
   Animates results table and computes GPA
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const tableRows = document.querySelectorAll(".data-table tbody tr");
  let totalPoints = 0;
  let subjects = 0;

  const gradePoints = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0,
  };

  tableRows.forEach((row, index) => {
    const gradeCell = row.querySelector(".grade");
    const grade = gradeCell.textContent.trim();

    // Animate row entry
    row.style.opacity = "0";
    row.style.transform = "translateY(10px)";
    setTimeout(() => {
      row.style.transition = "0.4s ease";
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, index * 100);

    // Color code grades
    switch (grade) {
      case "A":
        gradeCell.style.color = "#006b5b";
        break;
      case "B":
        gradeCell.style.color = "#007fa3";
        break;
      case "C":
        gradeCell.style.color = "#b89300";
        break;
      case "D":
        gradeCell.style.color = "darkorange";
        break;
      case "F":
        gradeCell.style.color = "crimson";
        break;
    }

    // GPA calculation
    if (gradePoints[grade] !== undefined) {
      totalPoints += gradePoints[grade];
      subjects++;
    }
  });

  // Display GPA
  const gpaDisplay = document.querySelector("#gpaDisplay");
  if (gpaDisplay && subjects > 0) {
    const gpa = (totalPoints / subjects).toFixed(2);
    gpaDisplay.textContent = `Your GPA: ${gpa}`;
  }
});
