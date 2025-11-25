/* =======================================================
   EDU Track - Fees Script (fees.js)
   Highlights pending fees and handles receipt button clicks
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector('.data-table tbody') || document.querySelector('#feesTable tbody');
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  fetch('/fees')
    .then(res => res.json())
    .then(data => {
      if (!tableBody) return;
      tableBody.innerHTML = '';
      let rows = data;
      if (logged && logged.role === 'student') rows = data.filter(f => f.student_id === logged.id);

      rows.forEach((fee) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${fee.fee_id}</td>
          <td>${fee.total_amount}</td>
          <td class="fee-status">${fee.status}</td>
          <td>${fee.due_date || ''}</td>
          <td><button class="btn btn-view">View</button></td>
        `;
        tableBody.appendChild(tr);

        const statusCell = tr.querySelector('.fee-status');
        if (statusCell && statusCell.textContent.toLowerCase().includes('pending')) {
          statusCell.style.color = 'crimson';
          statusCell.style.fontWeight = '600';
          tr.style.transition = '0.3s ease';
          tr.addEventListener('mouseenter', () => tr.style.background = 'rgba(255,0,0,0.05)');
          tr.addEventListener('mouseleave', () => tr.style.background = 'transparent');
        }

        const btn = tr.querySelector('.btn-view');
        if (btn) btn.addEventListener('click', () => alert('Your receipt is being downloaded (demo).'));
      });
    })
    .catch(() => {
      // fallback to existing static rows highlighting
      const rows = document.querySelectorAll('.data-table tbody tr');
      rows.forEach((row) => {
        const statusCell = row.querySelector('.fee-status');
        if (statusCell && statusCell.textContent.includes('Pending')) {
          statusCell.style.color = 'crimson';
          statusCell.style.fontWeight = '600';
          row.style.transition = '0.3s ease';
          row.addEventListener('mouseenter', () => (row.style.background = 'rgba(255,0,0,0.05)'));
          row.addEventListener('mouseleave', () => (row.style.background = 'transparent'));
        }
      });
    });
});
