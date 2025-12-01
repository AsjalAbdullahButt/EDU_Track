let allFees = [];
let allStudents = {};
let feeRefreshInterval = null;

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
        console.error('[fee_records] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[fee_records] fetchJson error', path, e);
    return null;
  }
}

async function loadFeeRecords(){
  const [feesRes, studentsRes] = await Promise.all([
    fetchJson('/fees'),
    fetchJson('/students')
  ]);

  allFees = feesRes || [];
  allStudents = Object.fromEntries((studentsRes||[]).map(s=>[s.student_id, s]));

  renderFeeTable();
}

function renderFeeTable(){
  const tbody = document.getElementById('feeList');
  if (!tbody) return;

  const nameFilter = (document.getElementById('filterName')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  // Filter fees
  let filtered = allFees.filter(fee => {
    const student = allStudents[fee.student_id];
    if (!student) return false;
    if (nameFilter && !student.full_name.toLowerCase().includes(nameFilter)) return false;
    if (statusFilter && (fee.payment_status || 'pending').toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  // Render table rows
  tbody.innerHTML = '';
  filtered.forEach((fee, idx) => {
    const student = allStudents[fee.student_id] || {};
    const tr = document.createElement('tr');
    const status = fee.payment_status || 'pending';
    tr.innerHTML = `
      <td data-label="#">${idx+1}</td>
      <td data-label="Student">${student.full_name || `#${fee.student_id}`}</td>
      <td data-label="Amount">${fee.amount || 0}</td>
      <td data-label="Due Date">${fee.due_date || '—'}</td>
      <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
    `;
    tbody.appendChild(tr);
  });

  if (filtered.length === 0){
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">No fees found</td></tr>';
  }
}

function startFeeRefresh(intervalMs = 12000){
  if (feeRefreshInterval) clearInterval(feeRefreshInterval);
  feeRefreshInterval = setInterval(() => loadFeeRecords(), intervalMs);
}

function stopFeeRefresh(){
  if (feeRefreshInterval) clearInterval(feeRefreshInterval);
  feeRefreshInterval = null;
}

function applyFilters() {
  renderFeeTable();
}

function clearFilters(){
  const filterForm = document.getElementById('feeFilters');
  if (filterForm) filterForm.reset();
  renderFeeTable();
}

window.addEventListener('DOMContentLoaded', () => {
  loadFeeRecords();
  startFeeRefresh(12000);

  // Stop on unload
  window.addEventListener('beforeunload', stopFeeRefresh);
  // Pause on tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopFeeRefresh();
    else startFeeRefresh(12000);
  });
});

window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.logout = () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = "/index.html";
};
