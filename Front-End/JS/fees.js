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

      // Update summary cards if present
      try{
        const totalElem = document.getElementById('totalFees');
        const paidElem = document.getElementById('paidFees');
        const pendingElem = document.getElementById('pendingFees');
        const total = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0);
        const paid = rows.reduce((s, r) => s + Number(r.amount_paid || 0), 0);
        const pending = total - paid;
        if (totalElem) totalElem.textContent = (total || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
        if (paidElem) paidElem.textContent = (paid || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
        if (pendingElem) pendingElem.textContent = (pending || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });
      }catch(e){ console.warn('Failed to update fee summary', e); }

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
        if (btn) btn.addEventListener('click', async () => {
          try {
            const res = await fetch(`/fees/${fee.fee_id}`);
            if (!res.ok) throw new Error('Could not fetch fee details');
            const detail = await res.json();
            // open printable receipt in new window
            const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Receipt</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h2{margin-bottom:6px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body>` +
              `<h2>Payment Receipt</h2><p><strong>Fee ID:</strong> ${detail.fee_id}</p>` +
              `<p><strong>Student ID:</strong> ${detail.student_id}</p>` +
              `<table><tr><th>Total</th><th>Paid</th><th>Status</th></tr><tr><td>${detail.total_amount}</td><td>${detail.amount_paid}</td><td>${detail.status}</td></tr></table>` +
              `<p>Due Date: ${detail.due_date || ''}</p><p>Generated: ${new Date().toLocaleString()}</p>` +
              `</body></html>`;
            const w = window.open('', '_blank');
            if (w) {
              w.document.open();
              w.document.write(html);
              w.document.close();
              // trigger print optionally
              setTimeout(()=>{ try{ w.print(); }catch(e){} }, 500);
            } else {
              showAlert('Popup blocked. Please allow popups to view receipts.', 'warning');
            }
          } catch (err) {
            console.error(err);
            showAlert('Unable to fetch receipt: ' + (err.message || ''), 'error');
          }
        });
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
