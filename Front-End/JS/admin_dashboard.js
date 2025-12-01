// Admin dashboard dynamic data loader
// Fetches counts from backend and populates the admin dashboard elements

async function fetchJson(path, opts = {}){
  try{
    const res = await fetch(path, opts);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  }catch(e){
    console.error('fetchJson error', path, e);
    if (window.showToast) window.showToast('Failed to load: ' + path, 'error');
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
    fetchJson('/faculty'),
    fetchJson('/fees'),
    fetchJson('/notifications'),
    // admin-only endpoint: include role header
    fetchJson('/admins/pending-profiles', { headers: adminHeaders })
  ]);

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
        tr.innerHTML = `
          <td>${name}</td>
          <td>${Number(f.total_amount || 0).toLocaleString()}</td>
          <td>${f.due_date ? (new Date(f.due_date)).toLocaleDateString() : '—'}</td>
          <td>${f.status || 'Pending'}</td>
          <td><button class=\"btn verify\" data-fee-id=\"${f.fee_id}\">Verify</button></td>
        `;
        tbody.appendChild(tr);
      });

      // attach handlers for verify buttons
      tbody.querySelectorAll('button.verify').forEach(btn => {
        btn.addEventListener('click', async (e)=>{
          const feeId = e.target.dataset.feeId;
          if (!feeId) return;
          // demo: call backend to mark as paid/verified if endpoint exists; for now just optimistic UI
          e.target.disabled = true; e.target.textContent = 'Verifying…';
          try{
            // Try to call a payment/verification endpoint if available
            const res = await fetch(`/fees/${feeId}`, { method: 'PUT', headers: {'Content-Type':'application/json', 'x-user-role': role }, body: JSON.stringify({ status: 'Paid', amount_paid: 0 }) });
            if (res && res.ok){
              e.target.textContent = 'Verified';
              if (window.showToast) window.showToast('Fee verified', 'success');
            } else {
              e.target.disabled = false; e.target.textContent = 'Verify';
              if (window.showToast) window.showToast('Failed to verify fee', 'error');
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

window.addEventListener('load', function(){
  // Protect admin dashboard and then load
  try {
    protectDashboard && protectDashboard('admin');
  } catch(e){ /* ignore */ }
  loadAdminDashboard();
});

window.loadAdminDashboard = loadAdminDashboard;
