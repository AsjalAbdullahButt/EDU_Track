/* ============================================================
   EDU Track - Admin Salary Payments Page
   ============================================================ */

async function fetchJson(path, opts = {}) {
  try {
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates) {
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        console.debug('[fetchJson] candidate failed', url, e.message);
      }
    }
  } catch (e) {
    try {
      const base2 = 'http://127.0.0.1:8000';
      const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
      for (const p of candidates2) {
        const fallback = base2 + p;
        try {
          const res2 = await fetch(fallback, opts);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {
          console.debug('[fetchJson] fallback failed', fallback, e2.message);
        }
      }
    } catch (e2) {
      console.error('[salary_payments] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadSalaryPayments() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const adminRole = session.role;
  if (adminRole !== 'admin') {
    if (window.showToast) window.showToast('Access denied', 'error');
    return;
  }

  // Fetch salary data
  const salariesRes = await fetchJson(`/salaries`);
  const facultyRes = await fetchJson('/faculties');
  
  const salaries = salariesRes || [];
  const faculty = facultyRes || [];

  // Render salary table
  const container = document.getElementById('salaryPaymentsList');
  if (!container) return;

  if (salaries.length === 0) {
    container.innerHTML = '<p class="empty-state">No salary records found</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Faculty ID</th>
        <th>Name</th>
        <th>Department</th>
        <th>Salary Amount</th>
        <th>Payment Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${salaries.map(s => {
        const fac = faculty.find(f => f.faculty_id === s.faculty_id);
        const status = s.payment_status || 'pending';
        const statusClass = status === 'paid' ? 'status-paid' : status === 'pending' ? 'status-pending' : 'status-overdue';
        
        const facName = fac?.name || fac?.faculty_name || fac?.full_name || 'N/A';
        return `
          <tr>
            <td>${s.faculty_id}</td>
            <td>${facName}</td>
            <td>${fac?.department || 'N/A'}</td>
            <td>${(s.amount || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</td>
            <td>${s.payment_date ? new Date(s.payment_date).toLocaleDateString() : 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
              ${status === 'pending' ? `<button class="btn-small btn-primary" onclick="approveSalary(${s.salary_id})">Approve</button>` : '<span class="text-success">✓</span>'}
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

async function approveSalary(salaryId) {
  const result = await fetchJson(`/salaries/${salaryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_status: 'paid', payment_date: new Date().toISOString() })
  });

  if (result) {
    if (window.showToast) window.showToast('Salary approved successfully', 'success');
    loadSalaryPayments();
  }
}

// Auto-refresh every 15 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadSalaryPayments();
  }, 15000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('admin');
  } catch (e) { }
  
  loadSalaryPayments();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
