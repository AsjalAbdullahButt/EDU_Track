let allEnrollments = [];
let allStudents = {};
let allCourses = {};
let recordsRefreshInterval = null;

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
        console.error('[admin_record] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[admin_record] fetchJson error', path, e);
    return null;
  }
}

async function loadEnrollmentRecords(){
  const table = document.getElementById('reportTable')?.querySelector('tbody');
  if (!table) return;

  const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
    fetchJson('/enrollments'),
    fetchJson('/students'),
    fetchJson('/courses')
  ]);

  allEnrollments = enrollmentsRes || [];
  allStudents = Object.fromEntries((studentsRes||[]).map(s=>[s.student_id, s.full_name]));
  allCourses = Object.fromEntries((coursesRes||[]).map(c=>[c.course_id, c.course_name]));

  // Populate course filter options
  const courseFilter = document.getElementById('filterCourse');
  if (courseFilter) {
    const existingOptions = Array.from(courseFilter.querySelectorAll('option')).slice(1); // keep "All"
    existingOptions.forEach(opt => opt.remove());
    (coursesRes || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.course_id;
      opt.textContent = c.course_name || `Course #${c.course_id}`;
      courseFilter.appendChild(opt);
    });
  }

  renderEnrollmentTable();

  // Attach filter listeners
  document.getElementById('applyFilters')?.addEventListener('click', renderEnrollmentTable);
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    document.getElementById('reportFilters').reset();
    renderEnrollmentTable();
  });
}

function renderEnrollmentTable(){
  const table = document.getElementById('reportTable')?.querySelector('tbody');
  if (!table) return;

  const from = document.getElementById('filterFrom')?.value || '';
  const to = document.getElementById('filterTo')?.value || '';
  const courseId = document.getElementById('filterCourse')?.value || '';
  const statusFilter = document.getElementById('filterStatus')?.value || '';

  // Filter enrollments
  let filtered = allEnrollments.filter(e => {
    if (courseId && e.course_id !== Number(courseId)) return false;
    if (statusFilter && (e.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  // Update summary cards
  const total = filtered.length;
  const active = new Set(filtered.filter(e => (e.status || 'Active').toLowerCase() === 'active').map(e => e.student_id)).size;
  const completed = filtered.filter(e => (e.status || '').toLowerCase() === 'completed').length;
  const dropped = filtered.filter(e => (e.status || '').toLowerCase() === 'dropped' || (e.status || '').toLowerCase() === 'withdrawn').length;

  document.getElementById('totalEnrollments').textContent = total;
  document.getElementById('activeStudents').textContent = active;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('dropoutCount').textContent = dropped;

  // Render table rows
  table.innerHTML = '';
  filtered.forEach((e, idx) => {
    const tr = document.createElement('tr');
    const studentName = allStudents[e.student_id] || `#${e.student_id}`;
    const courseName = allCourses[e.course_id] || `#${e.course_id}`;
    const status = e.status || 'Active';
    tr.innerHTML = `
      <td data-label="#">${idx+1}</td>
      <td data-label="Student">${studentName}</td>
      <td data-label="Course">${courseName}</td>
      <td data-label="Enrolled On">${e.semester || '—'}</td>
      <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
      <td data-label="Progress">${e.progress || '—'}</td>
    `;
    table.appendChild(tr);
  });

  if (filtered.length === 0) {
    table.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No records found</td></tr>';
  }
}

function startRecordsRefresh(intervalMs = 15000){
  if (recordsRefreshInterval) clearInterval(recordsRefreshInterval);
  recordsRefreshInterval = setInterval(() => loadEnrollmentRecords(), intervalMs);
}

function stopRecordsRefresh(){
  if (recordsRefreshInterval) clearInterval(recordsRefreshInterval);
  recordsRefreshInterval = null;
}

document.addEventListener('DOMContentLoaded', () => {
  loadEnrollmentRecords();
  startRecordsRefresh(15000);
  
  // Stop refresh on unload
  window.addEventListener('beforeunload', stopRecordsRefresh);
  // Pause on tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRecordsRefresh();
    else startRecordsRefresh(15000);
  });

  // Search functionality
  const search = document.getElementById('tableSearch');
  search?.addEventListener('input', (ev) => {
    const q = ev.target.value.toLowerCase();
    const table = document.getElementById('reportTable');
    Array.from(table?.querySelectorAll('tbody tr') || []).forEach(tr => {
      const text = tr.textContent.toLowerCase();
      tr.style.display = text.includes(q) ? '' : 'none';
    });
  });
});