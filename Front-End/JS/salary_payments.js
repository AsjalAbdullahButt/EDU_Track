let allSalaries = [];
let allFaculty = {};
let salaryRefreshInterval = null;

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
        console.error('[salary_payments] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[salary_payments] fetchJson error', path, e);
    return null;
  }
}

async function loadSalaries(){
  const [salariesRes, facultyRes] = await Promise.all([
    fetchJson('/salaries'),
    fetchJson('/faculties')
  ]);

  allSalaries = salariesRes || [];
  allFaculty = Object.fromEntries((facultyRes||[]).map(f=>[f.faculty_id, f]));

  renderSalaryTable();
  updateSalarySummary();
}

function renderSalaryTable(){
  const tableBody = document.querySelector('#salaryTable tbody');
  if (!tableBody) return;

  const from = document.getElementById('filterFrom')?.value || '';
  const to = document.getElementById('filterTo')?.value || '';
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  // Filter salaries
  let filtered = allSalaries.filter(s => {
    if (statusFilter && (s.payment_status || s.status || 'pending').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (from && new Date(s.payment_date || '') < new Date(from)) return false;
    if (to && new Date(s.payment_date || '') > new Date(to)) return false;
    return true;
  });

  // Render table rows
  tableBody.innerHTML = '';
  filtered.forEach((s, idx) => {
    const faculty = allFaculty[s.faculty_id];
    const tr = document.createElement('tr');
    const status = s.payment_status || s.status || 'pending';
    tr.innerHTML = `
      <td data-label="#">${idx + 1}</td>
      <td data-label="Faculty">${faculty?.full_name || `#${s.faculty_id}`}</td>
      <td data-label="Department">${faculty?.department || '—'}</td>
      <td data-label="Payment Date">${s.payment_date ? new Date(s.payment_date).toLocaleDateString() : '—'}</td>
      <td data-label="Amount">${s.amount || 0}</td>
      <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
      <td data-label="Actions">
        <button class="btn btn-sm primary" onclick="approveSalary(${s.salary_id})">Approve</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  if (filtered.length === 0){
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">No salary records found</td></tr>';
  }
}

function updateSalarySummary(){
  const totalPayments = document.getElementById('totalPayments');
  const paidCount = document.getElementById('paidCount');
  const pendingCount = document.getElementById('pendingCount');
  const overdueCount = document.getElementById('overdueCount');

  if (totalPayments) totalPayments.textContent = allSalaries.length;
  if (paidCount) paidCount.textContent = allSalaries.filter(s => (s.payment_status || s.status || '').toLowerCase() === 'paid').length;
  if (pendingCount) pendingCount.textContent = allSalaries.filter(s => (s.payment_status || s.status || 'pending').toLowerCase() === 'pending').length;
  if (overdueCount) overdueCount.textContent = allSalaries.filter(s => (s.payment_status || s.status || '').toLowerCase() === 'overdue').length;
}

async function approveSalary(salaryId){
  try{
    await fetchJson(`/salaries/${salaryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: 'Paid', payment_date: new Date().toISOString().split('T')[0] })
    });
    window.showToast?.(`Salary #${salaryId} approved`, 'success');
    await loadSalaries();
  }catch(e){
    console.error(e);
    window.showToast?.('Approval failed', 'error');
  }
}

function startSalaryRefresh(intervalMs = 15000){
  if (salaryRefreshInterval) clearInterval(salaryRefreshInterval);
  salaryRefreshInterval = setInterval(() => loadSalaries(), intervalMs);
}

function stopSalaryRefresh(){
  if (salaryRefreshInterval) clearInterval(salaryRefreshInterval);
  salaryRefreshInterval = null;
}

document.addEventListener('DOMContentLoaded', () => {
  loadSalaries();
  startSalaryRefresh(15000);

  // Wire up filter form
  const salaryFilters = document.getElementById('salaryFilters');
  if (salaryFilters){
    document.getElementById('applyFilters')?.addEventListener('click', () => {
      renderSalaryTable();
      updateSalarySummary();
    });
    document.getElementById('clearFilters')?.addEventListener('click', () => {
      salaryFilters.reset();
      renderSalaryTable();
      updateSalarySummary();
    });
  }

  window.addEventListener('beforeunload', stopSalaryRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopSalaryRefresh();
    else startSalaryRefresh(15000);
  });
});

window.approveSalary = approveSalary;
