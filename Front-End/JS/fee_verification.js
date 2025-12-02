let currentFee = null;
let feeVerificationRefreshInterval = null;

async function fetchJson(path, opts = {}){
  try{
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates){
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try{
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }catch(e){ console.debug('[fetchJson] candidate failed', url, e.message); }
    }
    throw new Error('All candidates failed');
  }catch(e){
    if (!path.startsWith('http')){
      try{
        const base2 = 'http://127.0.0.1:8000';
        const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
        for (const p of candidates2){
          const fallback = base2 + p;
          try{
            const res2 = await fetch(fallback, opts);
            if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
            return await res2.json();
          }catch(e2){ console.debug('[fetchJson] fallback failed', fallback, e2.message); }
        }
        throw new Error('Fallback candidates failed');
      }catch(e2){
        console.error('[fee_verification] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[fee_verification] fetchJson error', path, e);
    return null;
  }
}

async function loadFeeSubmissions(){
  const list = document.getElementById('feeVerificationList');
  if (!list) return;

  const [fees, students] = await Promise.all([
    fetchJson('/fees'),
    fetchJson('/students')
  ]);

  const studentsMap = Object.fromEntries((students||[]).map(s=>[s.student_id, s.full_name]));
  
  list.innerHTML = '';
  (fees||[]).forEach(f=>{
    // Only show pending fees for verification
    if ((f.payment_status || f.status || 'pending').toLowerCase() === 'pending'){
      const tr = document.createElement('tr');
      const name = studentsMap[f.student_id] || `#${f.student_id}`;
      const amount = f.amount || f.total_amount || 0;
      const status = f.payment_status || f.status || 'Pending';
      tr.innerHTML = `
        <td data-label="Student ID">${f.student_id}</td>
        <td data-label="Name">${name}</td>
        <td data-label="Amount">${amount}</td>
        <td data-label="Method">${f.payment_method || f.method || '—'}</td>
        <td data-label="Receipt"><button class="btn btn-sm" onclick="openReceipt(${f.fee_id})">View</button></td>
        <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
        <td data-label="Action"><button class="btn primary btn-sm" onclick="openReceipt(${f.fee_id})">Verify</button></td>
      `;
      list.appendChild(tr);
    }
  });

  if (list.innerHTML === ''){
    list.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">No pending fees for verification</td></tr>';
  }
}

async function openReceipt(feeId){
  try{
    const fee = await fetchJson(`/fees/${feeId}`);
    if(!fee){ window.showToast?.('Fee not found','error'); return; }
    currentFee = fee;
    const imgEl = document.getElementById('receiptImage');
    const noRec = document.getElementById('noReceipt');
    const src = fee.receipt_url || fee.receipt || null;
    if (src) {
      imgEl.style.display = 'block';
      noRec.style.display = 'none';
      imgEl.src = src;
    } else {
      imgEl.style.display = 'none';
      noRec.style.display = 'block';
      imgEl.src = '';
    }
    document.getElementById('receiptModal').style.display = 'grid';
  }catch(e){ console.error(e); window.showToast?.('Failed to open receipt','error'); }
}

function closeModal(){ document.getElementById('receiptModal').style.display = 'none'; }

async function approveFee(){
  const remarks = document.getElementById('remarks')?.value || '';
  if(!currentFee) return;
  try{
    const payload = { 
      student_id: currentFee.student_id, 
      amount: currentFee.amount || currentFee.total_amount,
      payment_status: 'Paid',
      payment_date: new Date().toISOString().split('T')[0]
    };
    await fetchJson(`/fees/${currentFee.fee_id}`, { 
      method: 'PUT', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify(payload)
    });
    window.createNotification?.({ message: `Your payment was approved. Remarks: ${remarks}`, recipient_id: currentFee.student_id });
    window.showToast?.('Payment approved','success');
    closeModal();
    await loadFeeSubmissions();
  }catch(e){ console.error(e); window.showToast?.('Approve failed','error'); }
}

async function rejectFee(){
  const remarks = document.getElementById('remarks')?.value || '';
  if(!currentFee) return;
  try{
    const payload = { 
      student_id: currentFee.student_id, 
      amount: currentFee.amount || currentFee.total_amount,
      payment_status: 'Rejected'
    };
    await fetchJson(`/fees/${currentFee.fee_id}`, { 
      method: 'PUT', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify(payload)
    });
    window.createNotification?.({ message: `Your payment was rejected. Remarks: ${remarks}`, recipient_id: currentFee.student_id });
    window.showToast?.('Payment rejected','info');
    closeModal();
    await loadFeeSubmissions();
  }catch(e){ console.error(e); window.showToast?.('Reject failed','error'); }
}

function startFeeVerificationRefresh(intervalMs = 10000){
  if (feeVerificationRefreshInterval) clearInterval(feeVerificationRefreshInterval);
  feeVerificationRefreshInterval = setInterval(() => loadFeeSubmissions(), intervalMs);
}

function stopFeeVerificationRefresh(){
  if (feeVerificationRefreshInterval) clearInterval(feeVerificationRefreshInterval);
  feeVerificationRefreshInterval = null;
}

window.openReceipt = openReceipt;
window.closeModal = closeModal;
window.approveFee = approveFee;
window.rejectFee = rejectFee;

window.addEventListener('DOMContentLoaded', () => {
  loadFeeSubmissions();
  startFeeVerificationRefresh(10000);
  
  window.addEventListener('beforeunload', stopFeeVerificationRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopFeeVerificationRefresh();
    else startFeeVerificationRefresh(10000);
  });
});
