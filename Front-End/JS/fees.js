/* =======================================================
   EDU Track - Fees Script (fees.js)
   Highlights pending fees and handles receipt button clicks
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector('.data-table tbody') || document.querySelector('#feesTable tbody');
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  if (!logged || !logged.id || logged.role !== 'student') {
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="5">Please log in to view your fees.</td></tr>';
    }
    return;
  }

  fetch(`/fees/student/${logged.id}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch fees');
      return res.json();
    })
    .then(data => {
      if (!tableBody) return;
      tableBody.innerHTML = '';
      const rows = Array.isArray(data) ? data : [];

      if (rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No fee records available.</td></tr>';
        return;
      }

      try{
        const totalElem = document.getElementById('totalFees');
        const paidElem = document.getElementById('paidFees');
        const pendingElem = document.getElementById('pendingFees');
        const total = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0);
        const paid = rows.reduce((s, r) => s + Number(r.amount_paid || 0), 0);
        const pending = total - paid;
        if (totalElem) totalElem.textContent = '$' + (total || 0).toLocaleString();
        if (paidElem) paidElem.textContent = '$' + (paid || 0).toLocaleString();
        if (pendingElem) pendingElem.textContent = '$' + (pending || 0).toLocaleString();
      }catch(e){ console.warn('Failed to update fee summary', e); }

      rows.forEach((fee) => {
        const tr = document.createElement('tr');
        const balance = (fee.total_amount || 0) - (fee.amount_paid || 0);
        tr.innerHTML = `
          <td>${fee.fee_id}</td>
          <td>$${fee.total_amount}</td>
          <td>$${fee.amount_paid}</td>
          <td>$${balance}</td>
          <td class="fee-status">${fee.status}</td>
          <td>${fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}</td>
          <td><button class="btn btn-view">View Receipt</button></td>
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
        if (btn) btn.addEventListener('click', async () => {
          try {
            const res = await fetch(`/fees/${fee.fee_id}`);
            if (!res.ok) throw new Error('Could not fetch fee details');
            const detail = await res.json();
            const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Fee Receipt</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h2{margin-bottom:6px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body>` +
              `<h2>Fee Payment Receipt</h2><p><strong>Fee ID:</strong> ${detail.fee_id}</p>` +
              `<p><strong>Student ID:</strong> ${detail.student_id}</p>` +
              `<table><tr><th>Total Amount</th><th>Amount Paid</th><th>Balance</th><th>Status</th></tr><tr><td>$${detail.total_amount}</td><td>$${detail.amount_paid}</td><td>$${(detail.total_amount - detail.amount_paid)}</td><td>${detail.status}</td></tr></table>` +
              `<p><strong>Due Date:</strong> ${detail.due_date ? new Date(detail.due_date).toLocaleDateString() : 'N/A'}</p><p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>` +
              `</body></html>`;
            const w = window.open('', '_blank');
            if (w) {
              w.document.open();
              w.document.write(html);
              w.document.close();
              setTimeout(()=>{ try{ w.print(); }catch(e){} }, 500);
            } else {
              if (window.showAlert) showAlert('Popup blocked. Please allow popups to view receipts.', 'warning');
            }
          } catch (err) {
            console.error(err);
            if (window.showAlert) showAlert('Unable to fetch receipt: ' + (err.message || ''), 'error');
          }
        });
      });
    })
    .catch((err) => {
      console.error('Failed to load fees:', err);
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7">Failed to load fee records. Please try again later.</td></tr>';
      }
    });
});
