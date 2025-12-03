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

  // Fetch fees for this student using the correct endpoint
  const feesRes = await fetchJson(`/fees/student/${studentId}`);
  const fees = feesRes || [];

  // Calculate totals
  const totalFees = fees.reduce((sum, f) => sum + (parseFloat(f.total_amount) || 0), 0);
  const paidFees = fees.reduce((sum, f) => sum + (parseFloat(f.amount_paid) || 0), 0);
  const pendingFees = totalFees - paidFees;
  const paymentPercentage = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  // Update summary with enhanced styling
  document.getElementById('totalFees').textContent = totalFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
  document.getElementById('paidFees').textContent = paidFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
  document.getElementById('pendingFees').textContent = pendingFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });

  // Render enhanced fee overview with circular progress
  const container = document.getElementById('feesTableContainer');
  if (!container) return;

  if (fees.length === 0) {
    container.innerHTML = '<p class="empty-state">No fees recorded</p>';
    return;
  }

  // Create fee overview card with circular progress
  const overviewHtml = `
    <div class="fee-overview-card">
      <div class="fee-overview-header">
        <h3>Overall Payment Status</h3>
      </div>
      <div class="fee-overview-content">
        <div class="circle-progress-container">
          <svg class="circular-progress" width="140" height="140" viewBox="0 0 140 140">
            <circle class="progress-bg" cx="70" cy="70" r="65" />
            <circle class="progress-fill ${paymentPercentage >= 80 ? '' : 'low-attendance'}" cx="70" cy="70" r="65" style="--percentage: ${paymentPercentage}" />
          </svg>
          <div class="circle-percentage" style="--color: ${paymentPercentage >= 80 ? 'var(--pastel-mint)' : '#ff6b6b'}">${paymentPercentage}%</div>
        </div>
        <div class="fee-stats">
          <div class="fee-stat-box">
            <span class="stat-label">Total Amount</span>
            <span class="stat-value">${totalFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
          </div>
          <div class="fee-stat-box">
            <span class="stat-label">Amount Paid</span>
            <span class="stat-value text-success">${paidFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
          </div>
          <div class="fee-stat-box">
            <span class="stat-label">Amount Due</span>
            <span class="stat-value text-danger">${pendingFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Create detailed fees table
  const tableHtml = `
    <div class="fee-records-section">
      <h3>Detailed Fee Records</h3>
      <div class="fee-records-table">
        <div class="table-header">
          <div class="col-id">ID</div>
          <div class="col-description">Description</div>
          <div class="col-amount">Total Amount</div>
          <div class="col-paid">Paid Amount</div>
          <div class="col-due">Due Date</div>
          <div class="col-status">Status</div>
          <div class="col-action">Action</div>
        </div>
        <div class="table-body">
          ${fees.map(f => {
            const totalAmt = parseFloat(f.total_amount) || 0;
            const paidAmt = parseFloat(f.amount_paid) || 0;
            const isPaid = paidAmt >= totalAmt;
            const statusClass = isPaid ? 'paid-row' : 'pending-row';
            const statusBg = isPaid ? '#27ae6020' : '#e74c3c20';
            const statusColor = isPaid ? '#27ae60' : '#e74c3c';
            const dueDate = new Date(f.due_date);
            const formattedDate = dueDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });

            return `
              <div class="table-row ${statusClass}">
                <div class="col-id">
                  <span class="fee-id">${f.fee_id}</span>
                </div>
                <div class="col-description">
                  <span class="description-text">${f.description || 'Tuition Fee'}</span>
                </div>
                <div class="col-amount">
                  <span class="amount-text">${totalAmt.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
                </div>
                <div class="col-paid">
                  <span class="paid-text" style="color: #27ae60; font-weight: 600">${paidAmt.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
                </div>
                <div class="col-due">
                  <span class="date-text">${formattedDate}</span>
                </div>
                <div class="col-status">
                  <span class="status-badge" style="background: ${statusBg}; color: ${statusColor}; border-left: 4px solid ${statusColor}">
                    ${isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div class="col-action">
                  ${!isPaid ? `<a href="/pages/student_pages/pay_fee.html?fee_id=${f.fee_id}" class="btn-pay">Pay Now</a>` : '<span class="paid-check">✓</span>'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = overviewHtml + tableHtml;

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
