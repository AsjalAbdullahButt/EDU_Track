/* ============================================================
   EDU Track - Student Fees Page
   ============================================================ */

async function fetchJson(path, opts = {}) {
  const base = window.API_BASE || '';
  const base2 = 'http://127.0.0.1:8000';
  
  const candidates = path.startsWith('http') ? [path] : [path, base2 + path];
  
  for (const url of candidates) {
    try {
      const res = await fetch(url, opts);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.debug('[fetchJson] failed', url, e.message);
    }
  }
  
  console.error('[fees] fetchJson failed for all candidates', path);
  if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
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

  // Render enhanced fee overview
  const container = document.getElementById('feesTableContainer');
  if (!container) return;

  if (fees.length === 0) {
    container.innerHTML = '<p class="empty-state">No fees recorded</p>';
    return;
  }

  // Create fee overview card
  const overviewHtml = `
    <div class="fee-overview-card">
      <div class="fee-overview-header">
        <h3>Fee Summary</h3>
      </div>
      <div class="fee-overview-content">
        <div class="fee-stats-grid">
          <div class="fee-stat-box">
            <span class="stat-label">Total Amount</span>
            <span class="stat-value">${totalFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
          </div>
          <div class="fee-stat-box">
            <span class="stat-label">Amount Paid</span>
            <span class="stat-value stat-success">${paidFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
          </div>
          <div class="fee-stat-box">
            <span class="stat-label">Amount Due</span>
            <span class="stat-value stat-danger">${pendingFees.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
          </div>
          <div class="fee-stat-box">
            <span class="stat-label">Payment Progress</span>
            <span class="stat-value">${paymentPercentage}%</span>
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
          <div class="col-id">Fee ID</div>
          <div class="col-description">Description</div>
          <div class="col-amount">Total Amount</div>
          <div class="col-paid">Paid Amount</div>
          <div class="col-balance">Balance</div>
          <div class="col-due">Due Date</div>
          <div class="col-status">Status</div>
          <div class="col-action">Action</div>
        </div>
        <div class="table-body">
          ${fees.map(f => {
            const totalAmt = parseFloat(f.total_amount) || 0;
            const paidAmt = parseFloat(f.amount_paid) || 0;
            const balance = totalAmt - paidAmt;
            const isPaid = balance <= 0;
            const statusClass = isPaid ? 'paid-row' : 'pending-row';
            const statusBg = isPaid ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)';
            const statusColor = isPaid ? '#27ae60' : '#e74c3c';
            const dueDate = f.due_date ? new Date(f.due_date) : null;
            const formattedDate = dueDate ? dueDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : 'N/A';

            return `
              <div class="table-row ${statusClass}">
                <div class="col-id">
                  <span class="fee-id">${f.fee_id}</span>
                </div>
                <div class="col-description">
                  <span class="description-text">Semester Fee - ${f.status === 'Paid' ? 'Completed' : 'Current'}</span>
                </div>
                <div class="col-amount">
                  <span class="amount-text">${totalAmt.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
                </div>
                <div class="col-paid">
                  <span class="paid-text">${paidAmt.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}</span>
                </div>
                <div class="col-balance">
                  <span class="balance-text" style="color: ${balance > 0 ? '#e74c3c' : '#27ae60'}; font-weight: 700">
                    ${balance.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })}
                  </span>
                </div>
                <div class="col-due">
                  <span class="date-text">${formattedDate}</span>
                </div>
                <div class="col-status">
                  <span class="status-badge" style="background: ${statusBg}; color: ${statusColor}; border-left: 4px solid ${statusColor}">
                    ${isPaid ? 'PAID' : 'PENDING'}
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