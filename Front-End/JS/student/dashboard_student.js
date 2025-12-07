function downloadTranscript() {
  if (typeof window.showToast === 'function') return window.showToast('Transcript download feature coming soon!', 'info');
  if (typeof window.showAlert === 'function') return window.showAlert('Transcript download feature coming soon!', 'info');
}

window.downloadTranscript = downloadTranscript;

// Load student dashboard statistics
function loadStudentDashboardStats() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  if (!user || user.role !== 'student') {
    console.error('No valid student user found in localStorage');
    return;
  }

  const studentId = user.id;
  console.log('Loading dashboard stats for student ID:', studentId);

  // Use the centralized dashboard stats endpoint
  fetch(`/students/${studentId}/dashboard/stats`)
    .then(res => {
      console.log('Response status:', res.status);
      if (!res.ok) {
        return res.text().then(text => {
          console.error('Error response:', text);
          throw new Error(`Failed to fetch dashboard stats: ${res.status} - ${text}`);
        });
      }
      return res.json();
    })
    .then(stats => {
      console.log('Dashboard stats received:', stats);
      
      // Update active courses count
      const activeCoursesEl = document.getElementById('activeCourses');
      if (activeCoursesEl) {
        activeCoursesEl.textContent = stats.enrolled_courses || 0;
      }
      
      // Update attendance percentage
      const attendanceEl = document.getElementById('attendancePercent');
      if (attendanceEl) {
        if (stats.total_attendance_records === 0) {
          attendanceEl.textContent = 'N/A';
        } else {
          attendanceEl.textContent = stats.attendance_percentage + '%';
        }
      }
      
      // Update CGPA
      const cgpaEl = document.getElementById('cgpaValue');
      if (cgpaEl) {
        if (!stats.cgpa || stats.cgpa === 0) {
          cgpaEl.textContent = 'N/A';
        } else {
          cgpaEl.textContent = stats.cgpa.toFixed(2);
        }
      }
      
      // Update fee status
      const feeStatusEl = document.getElementById('feeStatus');
      if (feeStatusEl) {
        feeStatusEl.textContent = stats.fee_status || 'N/A';
      }
    })
    .catch(err => {
      console.error('Error loading dashboard stats:', err);
      const activeCoursesEl = document.getElementById('activeCourses');
      const attendanceEl = document.getElementById('attendancePercent');
      const cgpaEl = document.getElementById('cgpaValue');
      const feeStatusEl = document.getElementById('feeStatus');
      
      if (activeCoursesEl) activeCoursesEl.textContent = 'Error';
      if (attendanceEl) attendanceEl.textContent = 'Error';
      if (cgpaEl) cgpaEl.textContent = 'Error';
      if (feeStatusEl) feeStatusEl.textContent = 'Error';
    });
}

// Load dashboard stats when page loads
document.addEventListener('DOMContentLoaded', loadStudentDashboardStats);
