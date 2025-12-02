// Admin dashboard dynamic data loader
// Fetches counts from backend and populates the admin dashboard elements

async function fetchJson(path, opts = {}){
  // Robust fetch helper: try relative URL, then fallback to localhost:8000 if needed.
  try{
    const base = window.API_BASE || '';
    // try candidates: path and path + '/'
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates){
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try{
        const res = await fetch(url, opts);
        if (!res.ok) {
          const text = await res.text().catch(()=>res.statusText || '');
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return await res.json();
      }catch(err){
        // try next candidate
        console.debug('[fetchJson] candidate failed', url, err.message || err);
      }
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
            if (!res2.ok){
              const txt2 = await res2.text().catch(()=>res2.statusText || '');
              throw new Error(`HTTP ${res2.status}: ${txt2}`);
            }
            return await res2.json();
          }catch(e2){
            console.debug('[fetchJson] fallback candidate failed', fallback, e2.message || e2);
          }
        }
        throw new Error('Fallback candidates failed');
      }catch(e2){
        console.error('fetchJson failed (both attempts)', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path} (${e2.message || e.message})`, 'error');
        return null;
      }
    }
    console.error('fetchJson error', path, e);
    if (window.showToast) window.showToast(`Failed to load: ${path} (${e.message})`, 'error');
    return null;
  }
}

async function loadAdminDashboard(){
  // Ensure user is admin
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const role = user.role || '';
  if (user && user.name){
    const nameEl = document.getElementById('adminName');
    if (nameEl) nameEl.textContent = user.name;
  }

  // Prepare headers for admin-only endpoints
  const adminHeaders = { 'Content-Type': 'application/json' };
  if (role) adminHeaders['x-user-role'] = role;

  // Fetch data in parallel
  const [students, faculty, fees, notifications, pendingProfiles] = await Promise.all([
    fetchJson('/students'),
    fetchJson('/faculties'),
    fetchJson('/fees'),
    fetchJson('/notifications'),
    // admin-only endpoint: include role header
    fetchJson('/admins/pending-profiles', { headers: adminHeaders })
  ]);

  // Diagnostic logs to help debug missing records
  try{
    console.debug('[admin_dashboard] students:', Array.isArray(students) ? students.length : students);
    console.debug('[admin_dashboard] faculties:', Array.isArray(faculty) ? faculty.length : faculty);
  }catch(e){ console.warn('Debug log failed', e); }

  // Students
  if (Array.isArray(students)){
    const val = document.getElementById('studentsCount');
    if (val) val.textContent = students.length.toLocaleString();
  }

  // Faculty
  if (Array.isArray(faculty)){
    const val = document.getElementById('facultyCount');
    if (val) val.textContent = faculty.length.toLocaleString();
  }

  // Fees: compute collection percent
  if (Array.isArray(fees)){
    let total = 0, paid = 0;
    fees.forEach(f => { total += Number(f.total_amount || 0); paid += Number(f.amount_paid || 0); });
    const percent = total > 0 ? Math.round((paid/total)*100) : 0;
    const el = document.getElementById('feeCollection');
    if (el) el.textContent = percent + '%';
  }

  // Pending requests = pending profiles + fees with status Pending
  let pendingCount = 0;
  if (Array.isArray(pendingProfiles)) pendingCount += pendingProfiles.length;
  if (Array.isArray(fees)) pendingCount += fees.filter(f=> (f.status||'').toLowerCase() === 'pending').length;
  const pendEl = document.getElementById('pendingRequestsCount');
  if (pendEl) pendEl.textContent = pendingCount;

  // Notifications
  if (Array.isArray(notifications)){
    const list = document.getElementById('adminNotificationList');
    if (list){
      list.innerHTML = '';
      notifications.slice(0,6).forEach(n => {
        const li = document.createElement('li');
        li.textContent = (n.message || '').trim();
        list.appendChild(li);
      });
    }
  }

  // Populate fee verification table (show most recent pending fees)
  if (Array.isArray(fees)){
    const tbody = document.querySelector('#feeVerificationTable tbody');
    if (tbody){
      tbody.innerHTML = '';
      const pendingFees = fees.filter(f=> (f.status||'').toLowerCase() === 'pending').slice(0,6);
      pendingFees.forEach(f => {
        const tr = document.createElement('tr');
        const name = f.student_id ? ('Student #' + f.student_id) : 'Unknown';
        const amount = Number(f.total_amount || 0);
        tr.innerHTML = `
          <td>${name}</td>
          <td data-amount="${amount}">${amount.toLocaleString()}</td>
          <td>${f.due_date ? (new Date(f.due_date)).toLocaleDateString() : '—'}</td>
          <td>${f.status || 'Pending'}</td>
          <td><button class="btn verify" data-fee-id="${f.fee_id}" data-fee-amount="${amount}">Verify</button></td>
        `;
        tbody.appendChild(tr);
      });

      // attach handlers for verify buttons
      tbody.querySelectorAll('button.verify').forEach(btn => {
            btn.addEventListener('click', async (e)=>{
          const feeId = e.target.dataset.feeId;
          const amount = Number(e.target.dataset.feeAmount || 0);
          if (!feeId) return;
          e.target.disabled = true; e.target.textContent = 'Verifying…';
          try{
            // Attempt to mark as paid; backend may accept PUT or PATCH
            const body = { status: 'Paid', amount_paid: amount };
            const res = await fetch(`/fees/${feeId}`, { method: 'PUT', headers: {'Content-Type':'application/json', 'x-user-role': role }, body: JSON.stringify(body) });
            if (res && res.ok){
              e.target.textContent = 'Verified';
              if (window.showToast) window.showToast('Fee verified', 'success');
              // Refresh dashboard to update counts
              setTimeout(() => loadAdminDashboard(), 800);
            } else {
              // Try PATCH as fallback
              try{
                const res2 = await fetch(`/fees/${feeId}`, { method: 'PATCH', headers: {'Content-Type':'application/json', 'x-user-role': role }, body: JSON.stringify(body) });
                if (res2 && res2.ok){
                  e.target.textContent = 'Verified';
                  if (window.showToast) window.showToast('Fee verified (patched)', 'success');
                  setTimeout(() => loadAdminDashboard(), 800);
                } else {
                  e.target.disabled = false; e.target.textContent = 'Verify';
                  if (window.showToast) window.showToast('Failed to verify fee', 'error');
                }
              }catch(e2){
                console.error('patch verify error', e2);
                e.target.disabled = false; e.target.textContent = 'Verify';
                if (window.showToast) window.showToast('Failed to verify fee', 'error');
              }
            }
          }catch(err){
            console.error('verify error', err);
            e.target.disabled = false; e.target.textContent = 'Verify';
            if (window.showToast) window.showToast('Failed to verify fee', 'error');
          }
        });
      });
    }
  }
}

let dashboardRefreshInterval = null;

// Auto-refresh dashboard every 10 seconds
function startDashboardRefresh(intervalMs = 10000){
  if (dashboardRefreshInterval) clearInterval(dashboardRefreshInterval);
  dashboardRefreshInterval = setInterval(() => loadAdminDashboard(), intervalMs);
}

// Stop the refresh
function stopDashboardRefresh(){
  if (dashboardRefreshInterval) clearInterval(dashboardRefreshInterval);
  dashboardRefreshInterval = null;
}

window.addEventListener('load', function(){
  // Protect admin dashboard and then load
  try {
    protectDashboard && protectDashboard('admin');
  } catch(e){ /* ignore */ }
  loadAdminDashboard();
  // Start auto-refresh every 10 seconds
  startDashboardRefresh(10000);
});

// Stop refresh when tab is closed
window.addEventListener('beforeunload', stopDashboardRefresh);

// Pause refresh when tab is hidden; resume when visible
document.addEventListener('visibilitychange', function(){
  if (document.hidden) stopDashboardRefresh();
  else startDashboardRefresh(10000);
});

window.loadAdminDashboard = loadAdminDashboard;
window.startDashboardRefresh = startDashboardRefresh;
window.stopDashboardRefresh = stopDashboardRefresh;
