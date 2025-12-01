/* =======================================================
   EDU Track - Courses Script (courses.js)
   Handles course card animations and details display
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector(".data-table tbody") || document.querySelector('#coursesTable tbody');

  // Try to fetch courses from backend; fallback to existing static rows
  fetch('/courses')
    .then(res => res.json())
    .then(data => {
      if (!tableBody) return;
      tableBody.innerHTML = '';
      data.forEach((course, index) => {
        const tr = document.createElement('tr');
        tr.style.opacity = '0';
        tr.style.transform = 'translateY(10px)';
        tr.innerHTML = `
          <td>${course.course_name}</td>
          <td>${course.course_code}</td>
          <td>${course.credit_hours}</td>
          <td>${course.faculty_id || ''}</td>
          <td><button class="btn btn-details">Details</button></td>
        `;
        tableBody.appendChild(tr);
        // animate
        setTimeout(() => {
          tr.style.transition = '0.3s ease';
          tr.style.opacity = '1';
          tr.style.transform = 'translateY(0)';
        }, index * 100);

        const btn = tr.querySelector('.btn-details');
        if (btn) btn.addEventListener('click', () => showAlert(`Opening details for ${course.course_name}`, 'info'));
      });
    })
    .catch(() => {
      // If fetch fails, keep any pre-rendered rows and animate them
      const rows = document.querySelectorAll('.data-table tbody tr');
      rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        setTimeout(() => {
          row.style.transition = '0.3s ease';
          row.style.opacity = '1';
          row.style.transform = 'translateY(0)';
        }, index * 100);
      });
    });
});
