/* ============================================================
   EDU Track - Student Courses Page
   ============================================================ */

async function loadEnrolledCourses() {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const studentId = session.id;

  if (!studentId) {
    if (window.showToast) window.showToast('Not logged in', 'error');
    return;
  }

  try {
    // Fetch enrollments, courses, and faculty using API helper
    const [enrollmentsRes, coursesRes, facultyRes] = await Promise.all([
      API.enrollments.getAll(),
      API.courses.getAll(),
      API.faculty.getAll()
    ]);

    const enrollments = (enrollmentsRes || []).filter(e => e.student_id === studentId);
    const courses = coursesRes || [];
    const faculty = facultyRes || [];

    // Map courses to enrollments with faculty info
    const enrolledCourses = enrollments.map(e => {
      const course = courses.find(c => c.course_id === e.course_id);
      if (!course) return null;
      
      const instructor = faculty.find(f => f.faculty_id === course.faculty_id);
      
      return { 
        ...course, 
        enrollment_id: e.enrollment_id, 
        enrolled_date: e.enrolled_date,
        instructor_name: instructor ? instructor.name : 'Not Assigned',
        department: instructor ? instructor.department : 'N/A'
      };
    }).filter(c => c && c.course_id);

  // Render courses table
  const container = document.getElementById('enrolledCoursesContainer');
  if (!container) return;

  // Clear the container first
  container.innerHTML = '';

  if (enrolledCourses.length === 0) {
    container.innerHTML = '<p class="empty-state">No courses enrolled. <a href="/pages/student_pages/add_courses.html">Browse courses</a></p>';
    return;
  }

  // helper to format dates safely
  function formatSafeDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  }

  const table = document.createElement('table');
  table.className = 'courses-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Course Code</th>
        <th>Course Name</th>
        <th>Department</th>
        <th>Credits</th>
        <th>Instructor</th>
        <th>Enrolled Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${enrolledCourses.map(c => `
        <tr>
          <td>${c.course_code || 'N/A'}</td>
          <td>${c.course_name || 'N/A'}</td>
          <td>${c.department || 'N/A'}</td>
          <td>${c.credit_hours || 'N/A'}</td>
          <td>${c.instructor_name || 'N/A'}</td>
          <td>${formatSafeDate(c.enrolled_date)}</td>
          <td>
            <button class="btn-small btn-danger" onclick="dropCourse(${c.enrollment_id})">
              <span class="btn-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 6h18v2H3V6zm2 3h14l-1.1 11.1A2 2 0 0 1 15.9 22H8.1a2 2 0 0 1-1.99-1.9L5 9zm6-6c.55 0 1 .45 1 1h4v2H5V4h4c0-.55.45-1 1-1z"/>
                </svg>
              </span>
              <span>Drop</span>
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  container.appendChild(table);
  
  // Add "Add New Course" button below the table
  const addButton = document.createElement('button');
  addButton.className = 'btn primary';
  addButton.textContent = '+ Add New Course';
  addButton.style.marginTop = '20px';
  addButton.onclick = () => {
    window.location.href = '/pages/student_pages/add_courses.html';
  };
  container.appendChild(addButton);
  } catch (error) {
    console.error('Error loading courses:', error);
    const container = document.getElementById('enrolledCoursesContainer');
    if (container) {
      container.innerHTML = '<p class="error-state">Failed to load courses. Please try again later.</p>';
    }
    if (window.showToast) window.showToast('Failed to load courses', 'error');
  }
}

async function dropCourse(enrollmentId) {
  if (!confirm('Are you sure you want to drop this course?')) return;

  try {
    await API.enrollments.delete(enrollmentId);
    if (window.showToast) window.showToast('Course dropped successfully', 'success');
    loadEnrolledCourses();
  } catch (error) {
    console.error('Error dropping course:', error);
    if (window.showToast) window.showToast('Failed to drop course', 'error');
  }
}

// Auto-refresh every 30 seconds
let refreshInterval = null;
function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    if (document.hidden) return;
    loadEnrolledCourses();
  }, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('student');
  } catch (e) { }
  
  loadEnrolledCourses();
  startAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoRefresh();
  else startAutoRefresh();
});
