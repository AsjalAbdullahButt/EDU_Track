document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main.admin-salary-page');
  if (!main) return;
  const api = main.dataset.api || '/api/admin/salaries';

  const tableBody = document.querySelector('#salaryTable tbody');
  const totalPayments = document.getElementById('totalPayments');
  const paidCount = document.getElementById('paidCount');
  const pendingCount = document.getElementById('pendingCount');
  const overdueCount = document.getElementById('overdueCount');

  function renderRows(rows) {
    tableBody.innerHTML = '';
    rows.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${r.faculty ? r.faculty.name : r.faculty_id}</td>
        <td>${r.faculty ? (r.faculty.department || '') : ''}</td>
        <td>${r.payment_date ? new Date(r.payment_date).toLocaleDateString() : ''}</td>
        <td class="status">${r.status}</td>
        <td>${r.amount}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function updateSummary(rows) {
    totalPayments.textContent = rows.length;
    paidCount.textContent = rows.filter(r => r.status === 'paid').length;
    pendingCount.textContent = rows.filter(r => r.status === 'pending').length;
    overdueCount.textContent = rows.filter(r => r.status === 'overdue').length;
  }

  // Fetch salaries from backend
  fetch(api)
    .then(res => res.json())
    .then(data => {
      renderRows(data);
      updateSummary(data);
    })
    .catch(err => {
      console.error('Failed to load salaries', err);
    });

  // Hook up filters (basic client-side filtering)
  const salaryFilters = document.getElementById('salaryFilters');
  if (salaryFilters) {
    salaryFilters.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = document.getElementById('filterFrom').value;
      const to = document.getElementById('filterTo').value;
      const dept = document.getElementById('filterDept').value;
      const status = document.getElementById('filterStatus').value;

      // Re-fetch and filter client-side for now
      fetch(api)
        .then(res => res.json())
        .then(rows => {
          let filtered = rows;
          if (from) filtered = filtered.filter(r => new Date(r.payment_date) >= new Date(from));
          if (to) filtered = filtered.filter(r => new Date(r.payment_date) <= new Date(to));
          if (dept) filtered = filtered.filter(r => r.faculty && r.faculty.department === dept);
          if (status) filtered = filtered.filter(r => r.status === status);
          renderRows(filtered);
          updateSummary(filtered);
        });
    });
  }
});
