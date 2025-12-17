// Admin Course Approvals - Enhanced with proper database connections
let allCourses = [];
let allFaculty = {};
let courseRefreshInterval = null;
let currentFilter = '';

// Utility: Fetch JSON with fallback handling
async function fetchJson(path, opts = {}) {
  try {
    const base = window.API_BASE || 'http://127.0.0.1:8000';
    const url = path.startsWith('http') ? path : base + path;
    
    const res = await fetch(url, opts);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    console.error('[Course Approvals] Fetch error:', path, e);
    showToast(`Failed to load: ${e.message}`, 'error');
    return null;
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Load courses from backend with optional status filter
async function loadCourses(statusFilter = null) {
  showLoadingSpinner(true);
  
  try {
    // Determine filter to use
    const filter = statusFilter !== null ? statusFilter : currentFilter;
    
    // Build query parameters
    const queryParams = filter ? `?status=${encodeURIComponent(filter)}` : '';
    
    // Fetch courses and faculty in parallel
    const [coursesRes, facultyRes] = await Promise.all([
      fetchJson(`/courses${queryParams}`),
      fetchJson('/faculties')
    ]);

    if (coursesRes === null) {
      showToast('Failed to load courses', 'error');
      showLoadingSpinner(false);
      return;
    }

    allCourses = coursesRes || [];
    allFaculty = Object.fromEntries(
      (facultyRes || []).map(f => [
        f.faculty_id, 
        f.name || f.full_name || f.faculty_name || `Faculty #${f.faculty_id}`
      ])
    );

    console.log(`Loaded ${allCourses.length} courses with filter: "${filter || 'none'}"`);
    
    renderCourseTable();
    updateStatistics();
    showLoadingSpinner(false);
  } catch (e) {
    console.error('Error loading courses:', e);
    showToast('Error loading courses', 'error');
    showLoadingSpinner(false);
  }
}

// Render course table
function renderCourseTable() {
  const courseList = document.getElementById('courseList');
  const tableContainer = document.getElementById('courseTableContainer');
  
  if (!courseList) return;

  courseList.innerHTML = '';

  if (allCourses.length === 0) {
    tableContainer.style.display = 'none';
    courseList.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div>
            <h3>No courses found</h3>
            <p>There are no courses matching the current filter.</p>
          </div>
        </td>
      </tr>
    `;
    tableContainer.style.display = 'table';
    return;
  }

  tableContainer.style.display = 'table';

  allCourses.forEach((course) => {
    const row = document.createElement('tr');
    const facultyName = allFaculty[course.faculty_id] || `Faculty #${course.faculty_id}`;
    const status = course.course_status || 'Pending';
    const courseCode = course.course_code || '—';
    const creditHours = course.credit_hours || '—';
    
    row.innerHTML = `
      <td data-label="Course ID">${course.course_id}</td>
      <td data-label="Course Code"><strong>${courseCode}</strong></td>
      <td data-label="Course Title">${course.course_name || '—'}</td>
      <td data-label="Credit Hours">${creditHours}</td>
      <td data-label="Instructor">${facultyName}</td>
      <td data-label="Status">
        <span class="status-badge status-${status.toLowerCase()}">${status}</span>
      </td>
      <td data-label="Actions">
        <div class="action-buttons">
          ${status === 'Pending' ? `
            <button class="btn-approve" onclick="approveCourse(${course.course_id})">
              ✓ Approve
            </button>
            <button class="btn-reject" onclick="rejectCourse(${course.course_id})">
              ✗ Reject
            </button>
          ` : status === 'Rejected' ? `
            <button class="btn-approve" onclick="approveCourse(${course.course_id})">
              ✓ Approve
            </button>
          ` : `
            <button class="btn-reject" onclick="rejectCourse(${course.course_id})">
              ✗ Reject
            </button>
          `}
        </div>
      </td>
    `;
    courseList.appendChild(row);
  });
}

// Update statistics cards
function updateStatistics() {
  const pending = allCourses.filter(c => (c.course_status || 'Pending') === 'Pending').length;
  const active = allCourses.filter(c => c.course_status === 'Active').length;
  const rejected = allCourses.filter(c => c.course_status === 'Rejected').length;
  const total = allCourses.length;

  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('activeCount').textContent = active;
  document.getElementById('rejectedCount').textContent = rejected;
  document.getElementById('totalCount').textContent = total;
}

// Show/hide loading spinner
function showLoadingSpinner(show) {
  const spinner = document.getElementById('loadingSpinner');
  const table = document.getElementById('courseTableContainer');
  
  if (spinner) {
    spinner.style.display = show ? 'flex' : 'none';
  }
  if (table) {
    table.style.opacity = show ? '0.5' : '1';
  }
}

// Approve a course
async function approveCourse(courseId) {
  if (!confirm(`Are you sure you want to approve course #${courseId}?`)) {
    return;
  }

  try {
    const result = await fetchJson(`/courses/${courseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_status: 'Active' })
    });

    if (result) {
      showToast(`Course #${courseId} has been approved successfully!`, 'success');
      await loadCourses();
    }
  } catch (e) {
    console.error('Approval error:', e);
    showToast('Failed to approve course', 'error');
  }
}

// Reject a course
async function rejectCourse(courseId) {
  if (!confirm(`Are you sure you want to reject course #${courseId}?`)) {
    return;
  }

  try {
    const result = await fetchJson(`/courses/${courseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_status: 'Rejected' })
    });

    if (result) {
      showToast(`Course #${courseId} has been rejected.`, 'info');
      await loadCourses();
    }
  } catch (e) {
    console.error('Rejection error:', e);
    showToast('Failed to reject course', 'error');
  }
}

// Auto-refresh functionality
function startCourseRefresh(intervalMs = 30000) {
  if (courseRefreshInterval) clearInterval(courseRefreshInterval);
  courseRefreshInterval = setInterval(() => {
    console.log('Auto-refreshing courses...');
    loadCourses();
  }, intervalMs);
}

function stopCourseRefresh() {
  if (courseRefreshInterval) {
    clearInterval(courseRefreshInterval);
    courseRefreshInterval = null;
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log('Course Approvals page initialized');
  
  // Load courses initially
  loadCourses();
  
  // Setup filter change handler
  const filterSelect = document.getElementById('statusFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      loadCourses(currentFilter);
    });
  }
  
  // Start auto-refresh
  startCourseRefresh(30000);

  // Handle visibility changes (pause refresh when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCourseRefresh();
    } else {
      loadCourses();
      startCourseRefresh(30000);
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', stopCourseRefresh);
});

// Export functions to global scope
window.approveCourse = approveCourse;
window.rejectCourse = rejectCourse;
window.loadCourses = loadCourses;
