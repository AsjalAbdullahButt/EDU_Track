// Extracted from fee_verification.html
let currentFee = null;

async function loadFeeSubmissions(){
  const list = document.getElementById('feeVerificationList');
  list.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  try{
    const [fees, students] = await Promise.all([
      fetch('/fees').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/students').then(r=>r.ok?r.json():[]).catch(()=>[])
    ]);
    const studentsMap = Object.fromEntries((students||[]).map(s=>[s.student_id,s.full_name]));
    list.innerHTML = '';
    (fees||[]).forEach(f=>{
      const tr = document.createElement('tr');
      const name = studentsMap[f.student_id]||`#${f.student_id}`;
      const amount = f.total_amount;
      const status = f.status || ((Number(f.amount_paid||0) >= Number(f.total_amount||0)) ? 'Paid' : 'Pending');
      tr.innerHTML = `
        <td>${f.student_id}</td>
        <td>${name}</td>
        <td>${amount}</td>
        <td>${f.method || '—'}</td>
        <td><button class="btn" onclick="openReceipt(${f.fee_id})">View</button></td>
        <td>${status}</td>
        <td>${status === 'Pending' ? `<button class="btn primary" onclick="openReceipt(${f.fee_id})">Verify</button>` : ''}</td>
      `;
      list.appendChild(tr);
    });
  }catch(e){ console.error(e); list.innerHTML = '<tr><td colspan="7">Failed to load fee submissions.</td></tr>'; }
}

async function openReceipt(feeId){
  try{
    const fee = await fetch(`/fees/${feeId}`).then(r=>r.ok?r.json():null);
    if(!fee){ window.showToast?.('Fee not found','error'); return; }
    currentFee = fee;
    document.getElementById('receiptImage').src = fee.receipt || '/static/Images/sample_receipt1.png';
    document.getElementById('receiptModal').style.display = 'grid';
  }catch(e){ console.error(e); window.showToast?.('Failed to open receipt','error'); }
}

function closeModal(){ document.getElementById('receiptModal').style.display = 'none'; }

async function approveFee(){
  const remarks = document.getElementById('remarks').value;
  if(!currentFee) return;
  try{
    const payload = { student_id: currentFee.student_id, total_amount: currentFee.total_amount, amount_paid: currentFee.total_amount, due_date: currentFee.due_date, status: 'Paid' };
    await fetch(`/fees/${currentFee.fee_id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    window.createNotification?.({ message: `Your payment was approved. Remarks: ${remarks}`, recipient_id: currentFee.student_id });
    window.showToast?.('Payment approved','success');
    closeModal();
    await loadFeeSubmissions();
  }catch(e){ console.error(e); window.showToast?.('Approve failed','error'); }
}

async function rejectFee(){
  const remarks = document.getElementById('remarks').value;
  if(!currentFee) return;
  try{
    const payload = { student_id: currentFee.student_id, total_amount: currentFee.total_amount, amount_paid: currentFee.amount_paid || 0, due_date: currentFee.due_date, status: 'Rejected' };
    await fetch(`/fees/${currentFee.fee_id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    window.createNotification?.({ message: `Your payment was rejected. Remarks: ${remarks}`, recipient_id: currentFee.student_id });
    window.showToast?.('Payment rejected','info');
    closeModal();
    await loadFeeSubmissions();
  }catch(e){ console.error(e); window.showToast?.('Reject failed','error'); }
}

window.openReceipt = openReceipt;
window.closeModal = closeModal;
window.approveFee = approveFee;
window.rejectFee = rejectFee;

window.addEventListener('DOMContentLoaded', loadFeeSubmissions);
