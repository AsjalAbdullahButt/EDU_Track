/* ============================================================
   EDU Track - Student Fees Page
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
      console.error('[fees] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadFees() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch fees for this student
  const feesRes = await fetchJson(`/fees`);
  const fees = (feesRes || []).filter(f => f.student_id === studentId);

  // Calculate totals
  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidFees = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const pendingFees = totalFees - paidFees;

  // Update summary
  document.getElementById('totalFees').textContent = totalFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
  document.getElementById('paidFees').textContent = paidFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
  document.getElementById('pendingFees').textContent = pendingFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });

  // Render fees table
  const container = document.getElementById('feesTableContainer');
  if (!container) return;

  if (fees.length === 0) {
    container.innerHTML = '<p class="empty-state">No fees recorded</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'fees-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Fee ID</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Paid Amount</th>
        <th>Due Date</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${fees.map(f => {
        const status = f.paid_amount >= f.amount ? 'Paid' : 'Pending';
        const statusClass = status === 'Paid' ? 'status-paid' : 'status-pending';
        return `
          <tr>
            <td>${f.fee_id}</td>
            <td>${f.description || 'Tuition'}</td>
            <td>${(f.amount || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</td>
            <td>${(f.paid_amount || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</td>
            <td>${new Date(f.due_date).toLocaleDateString()}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
              ${status === 'Pending' ? `<a href="/pages/student_pages/pay_fee.html?fee_id=${f.fee_id}" class="btn-small btn-primary">Pay Now</a>` : '<span class="text-success">✓</span>'}
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// Auto-refresh every 30 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadFees();
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadFees();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
