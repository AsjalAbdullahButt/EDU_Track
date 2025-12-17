/* ============================================================
   EDU Track - Admin Salary Payments Page
   ============================================================ */

let allSalaries = [];
let allFaculty = [];
let filteredSalaries = [];
let currentPage = 1;
const itemsPerPage = 10;

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
      console.error('[salary_payments] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

async function loadSalaryPayments() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const adminRole = session.role;
  if (adminRole !== 'admin') {
    if (window.showToast) window.showToast('Access denied', 'error');
    return;
  }

  // Fetch salary data and faculty data
  const [salariesRes, facultyRes] = await Promise.all([
    fetchJson('/salaries'),
    fetchJson('/faculties')
  ]);
  
  allSalaries = salariesRes || [];
  allFaculty = facultyRes || [];

  // Populate department filter
  populateDepartmentFilter();
  
  // Apply filters and render
  applyFiltersAndRender();
}

function populateDepartmentFilter() {
  const deptFilter = document.getElementById('filterDept');
  if (!deptFilter) return;

  const departments = [...new Set(allFaculty.map(f => f.department).filter(Boolean))];
  deptFilter.innerHTML = '<option value="">All</option>' + 
    departments.map(d => `<option value="${d}">${d}</option>`).join('');
}

function applyFiltersAndRender() {
  const fromDate = document.getElementById('filterFrom')?.value || '';
  const toDate = document.getElementById('filterTo')?.value || '';
  const department = document.getElementById('filterDept')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const searchTerm = document.getElementById('tableSearch')?.value.toLowerCase() || '';

  filteredSalaries = allSalaries.filter(s => {
    // Date filters
    if (fromDate && s.payment_date && new Date(s.payment_date) < new Date(fromDate)) return false;
    if (toDate && s.payment_date && new Date(s.payment_date) > new Date(toDate)) return false;
    
    // Status filter
    const salaryStatus = (s.status || 'pending').toLowerCase();
    if (status && salaryStatus !== status.toLowerCase()) return false;
    
    // Department filter
    const faculty = allFaculty.find(f => f.faculty_id === s.faculty_id);
    if (department && faculty?.department !== department) return false;
    
    // Search filter
    if (searchTerm) {
      const facultyName = (faculty?.name || '').toLowerCase();
      const facultyDept = (faculty?.department || '').toLowerCase();
      if (!facultyName.includes(searchTerm) && !facultyDept.includes(searchTerm)) return false;
    }
    
    return true;
  });

  currentPage = 1;
  renderTable();
  updateSummaryCards();
  renderPagination();
}

function renderTable() {
  const tableBody = document.querySelector('#salaryTable tbody');
  if (!tableBody) return;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = filteredSalaries.slice(start, end);

  if (pageData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">No salary records found</td></tr>';
    return;
  }

  tableBody.innerHTML = pageData.map((s, idx) => {
    const faculty = allFaculty.find(f => f.faculty_id === s.faculty_id);
    const status = (s.status || 'pending').toLowerCase();
    const statusClass = `status-${status}`;
    
    return `
      <tr>
        <td data-label="#">${start + idx + 1}</td>
        <td data-label="Faculty">${faculty?.name || `Faculty #${s.faculty_id}`}</td>
        <td data-label="Department">${faculty?.department || '—'}</td>
        <td data-label="Payment Date">${s.payment_date ? new Date(s.payment_date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : '—'}</td>
        <td data-label="Status"><span class="${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
        <td data-label="Amount">PKR ${(s.amount || 0).toLocaleString('en-PK')}</td>
        <td data-label="Actions">
          ${status === 'pending' 
            ? `<button class="btn btn-sm primary" onclick="approveSalary(${s.salary_id})">Approve</button>` 
            : `<button class="btn btn-sm" disabled>Paid ✓</button>`}
        </td>
      </tr>
    `;
  }).join('');
}

function updateSummaryCards() {
  const totalPayments = document.getElementById('totalPayments');
  const paidCount = document.getElementById('paidCount');
  const pendingCount = document.getElementById('pendingCount');
  const overdueCount = document.getElementById('overdueCount');

  if (totalPayments) totalPayments.textContent = filteredSalaries.length;
  if (paidCount) paidCount.textContent = filteredSalaries.filter(s => ['paid', 'completed'].includes((s.status || '').toLowerCase())).length;
  if (pendingCount) pendingCount.textContent = filteredSalaries.filter(s => (s.status || 'pending').toLowerCase() === 'pending').length;
  if (overdueCount) overdueCount.textContent = filteredSalaries.filter(s => (s.status || '').toLowerCase() === 'overdue').length;
}

function renderPagination() {
  const pagination = document.getElementById('salaryPagination');
  if (!pagination) return;

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  
  // Previous button
  html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">« Prev</button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button class="${currentPage === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<span>...</span>`;
    }
  }
  
  // Next button
  html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Next »</button>`;
  
  pagination.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderTable();
  renderPagination();
}

async function approveSalary(salaryId) {
  if (!confirm('Are you sure you want to approve this salary payment?')) return;
  
  const result = await fetchJson(`/salaries/${salaryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'paid' })
  });

  if (result) {
    if (window.showToast) window.showToast('Salary approved successfully', 'success');
    await loadSalaryPayments();
  } else {
    if (window.showToast) window.showToast('Failed to approve salary', 'error');
  }
}

function exportToCSV() {
  if (filteredSalaries.length === 0) {
    if (window.showToast) window.showToast('No data to export', 'warning');
    return;
  }

  const headers = ['Faculty ID', 'Faculty Name', 'Department', 'Payment Date', 'Amount', 'Status'];
  const rows = filteredSalaries.map(s => {
    const faculty = allFaculty.find(f => f.faculty_id === s.faculty_id);
    return [
      s.faculty_id,
      faculty?.name || 'N/A',
      faculty?.department || 'N/A',
      s.payment_date ? new Date(s.payment_date).toLocaleDateString() : 'N/A',
      s.amount || 0,
      s.status || 'pending'
    ];
  });

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `salary_payments_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  if (window.showToast) window.showToast('CSV exported successfully', 'success');
}

function exportToPDF() {
  if (window.showToast) window.showToast('PDF export feature coming soon', 'info');
  // TODO: Implement PDF export using a library like jsPDF
}

// Auto-refresh every 15 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadSalaryPayments();
  }, 15000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('admin');
  } catch (e) { }
  
  loadSalaryPayments();
  startAutoRefresh();

  // Event listeners
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyFiltersAndRender();
    });
  }

  const clearFiltersBtn = document.getElementById('clearFilters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('salaryFilters')?.reset();
      document.getElementById('tableSearch').value = '';
      applyFiltersAndRender();
    });
  }

  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFiltersAndRender();
    });
  }

  const exportCsvBtn = document.getElementById('exportCsv');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportToCSV);
  }

  const exportPdfBtn = document.getElementById('exportPdf');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', exportToPDF);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});

// Expose functions to global scope
window.approveSalary = approveSalary;
window.goToPage = goToPage;

