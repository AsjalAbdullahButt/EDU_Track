/* ============================================================
   EDU Track - Student Pay Fee Page
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
      console.error('[pay_fee] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadFeeDetails() {
  const params = new URLSearchParams(window.location.search);
  const feeId = params.get('fee_id');

  if (!feeId) {
    if (window.showToast) window.showToast('Invalid fee ID', 'error');
    return;
  }

  const feesRes = await fetchJson(`/fees`);
  const fees = feesRes || [];
  const fee = fees.find(f => f.fee_id === parseInt(feeId));

  if (!fee) {
    if (window.showToast) window.showToast('Fee not found', 'error');
    return;
  }

  // Display fee details
  if (document.getElementById('feeAmount')) {
    document.getElementById('feeAmount').textContent = fee.amount.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
  }
  if (document.getElementById('feeDueDate')) {
    document.getElementById('feeDueDate').textContent = new Date(fee.due_date).toLocaleDateString();
  }
  if (document.getElementById('feeDescription')) {
    document.getElementById('feeDescription').textContent = fee.description || 'Tuition Fee';
  }

  // Store fee details for payment processing
  window.currentFee = fee;
}

async function processPayment() {
  const fee = window.currentFee;
  if (!fee) {
    if (window.showToast) window.showToast('Fee details not loaded', 'error');
    return;
  }

  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const paymentMethod = document.getElementById('paymentMethod')?.value || 'card';
  const amount = parseFloat(document.getElementById('paymentAmount')?.value) || fee.amount;

  if (amount <= 0 || amount > fee.amount) {
    if (window.showToast) window.showToast('Invalid payment amount', 'error');
    return;
  }

  // Simulate payment processing
  const payment = {
    fee_id: fee.fee_id,
    student_id: session.id,
    amount: amount,
    payment_method: paymentMethod,
    payment_date: new Date().toISOString(),
    status: 'completed'
  };

  const result = await fetchJson(`/fees/${fee.fee_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paid_amount: (fee.paid_amount || 0) + amount })
  });

  if (result) {
    if (window.showToast) window.showToast('Payment processed successfully!', 'success');
    setTimeout(() => window.location.href = '/pages/student_pages/fees.html', 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadFeeDetails();
});
