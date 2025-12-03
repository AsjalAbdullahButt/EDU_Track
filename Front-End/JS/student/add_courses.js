/* ============================================================
   EDU Track - Add Courses Page (Student)
   Handles course catalog browsing, filtering, and enrollment
   ============================================================ */

let allCourses = [];
let enrolledCourses = [];
let courseRefreshInterval = null;

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
    throw new Error('All candidates failed');
  } catch (e) {
    if (!path.startsWith('http')) {
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
        console.error('[add_courses] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[add_courses] fetchJson error', path, e);
    return null;
  }
}

async function loadCourses() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  // Fetch all courses and enrolled courses
  const [coursesRes, enrollmentsRes] = await Promise.all([
    fetchJson('/courses'),
    fetchJson(`/enrollments`)
  ]);

  allCourses = coursesRes || [];
  
  // Get enrolled course IDs for this student
  const studentEnrollments = (enrollmentsRes || []).filter(e => e.student_id === studentId);
  enrolledCourses = studentEnrollments.map(e => e.course_id);

  renderCourseTable();
}

function renderCourseTable() {
  const tbody = document.getElementById('coursesTableBody');
  if (!tbody) return;

  const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const department = document.getElementById('departmentFilter')?.value || '';
  const creditsFilter = document.getElementById('creditsFilter')?.value || '';
  const seatsFilter = document.getElementById('seatsFilter')?.value || '';

  // Filter courses
  let filteredCourses = allCourses.filter(course => {
    if (enrolledCourses.includes(course.course_id)) return false; // Already enrolled
    
    const matchesSearch = !searchTerm || 
      course.course_name?.toLowerCase().includes(searchTerm) ||
      course.course_code?.toLowerCase().includes(searchTerm);
    
    const matchesDept = !department || course.department === department;
    
    let matchesCredits = true;
    if (creditsFilter) {
      matchesCredits = course.credit_hours === parseInt(creditsFilter);
    }

    let matchesSeats = true;
    if (seatsFilter === 'Available') {
      matchesSeats = (course.available_seats || 999) > 0;
    } else if (seatsFilter === 'Full') {
      matchesSeats = (course.available_seats || 0) === 0;
    }

    return matchesSearch && matchesDept && matchesCredits && matchesSeats;
  });

  // Render table
  tbody.innerHTML = '';
  filteredCourses.forEach(course => {
    const tr = document.createElement('tr');
    const seatsAvailable = (course.available_seats || 999) > 0;
    const seatsText = seatsAvailable ? 
      `${course.available_seats || 'Available'}/Unlimited` : 
      'Full';
    
    tr.innerHTML = `
      <td><strong>${course.course_code}</strong></td>
      <td>${course.course_name}</td>
      <td>${course.department || 'N/A'}</td>
      <td><span class="credits-badge">${course.credit_hours || 0}</span></td>
      <td><span class="seats-status ${seatsAvailable ? 'seats-available' : 'seats-full'}">${seatsText}</span></td>
      <td class="action-cell">
        <button class="btn-small btn-blue-light enroll-btn" 
                onclick="enrollInCourse(${course.course_id}, '${course.course_code}')"
                ${!seatsAvailable ? 'disabled' : ''}>
          <span class="btn-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
          </span>
          <span>${seatsAvailable ? 'Enroll' : 'Full'}</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Update UI
  const totalCourses = document.getElementById('totalCourses');
  if (totalCourses) totalCourses.textContent = `${filteredCourses.length} courses`;

  const noCoursesMsg = document.getElementById('noCoursesMessage');
  const coursesTable = document.getElementById('coursesTable');
  if (filteredCourses.length === 0) {
    if (coursesTable) coursesTable.style.display = 'none';
    if (noCoursesMsg) noCoursesMsg.style.display = 'block';
  } else {
    if (coursesTable) coursesTable.style.display = 'table';
    if (noCoursesMsg) noCoursesMsg.style.display = 'none';
  }
}

async function enrollInCourse(courseId, courseCode) {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to enroll in ${courseCode}?`)) return;

  const payload = {
    student_id: studentId,
    course_id: courseId,
    semester: new Date().getFullYear(),
    status: 'Active'
  };

  const result = await fetchJson('/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result) {
    if (window.showToast) window.showToast(`Successfully enrolled in ${courseCode}!`, 'success');
    enrolledCourses.push(courseId);
    renderCourseTable();
  } else {
    if (window.showToast) window.showToast('Failed to enroll. Try again.', 'error');
  }
}

function searchCourses() {
  renderCourseTable();
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('departmentFilter').value = '';
  document.getElementById('creditsFilter').value = '';
  document.getElementById('seatsFilter').value = '';
  renderCourseTable();
}

function startCourseRefresh(intervalMs = 30000) {
  if (courseRefreshInterval) clearInterval(courseRefreshInterval);
  courseRefreshInterval = setInterval(() => loadCourses(), intervalMs);
}

function stopCourseRefresh() {
  if (courseRefreshInterval) clearInterval(courseRefreshInterval);
  courseRefreshInterval = null;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }

  loadCourses();
  startCourseRefresh(30000);

  // Wire up filter listeners
  document.getElementById('departmentFilter')?.addEventListener('change', renderCourseTable);
  document.getElementById('creditsFilter')?.addEventListener('change', renderCourseTable);
  document.getElementById('seatsFilter')?.addEventListener('change', renderCourseTable);
  document.getElementById('searchInput')?.addEventListener('input', renderCourseTable);

  window.addEventListener('beforeunload', stopCourseRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCourseRefresh();
    else startCourseRefresh(30000);
  });
});

// Expose functions
window.enrollInCourse = enrollInCourse;
window.searchCourses = searchCourses;
window.clearFilters = clearFilters;
