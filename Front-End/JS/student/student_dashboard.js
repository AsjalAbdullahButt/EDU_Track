/* Student Dashboard Data Loader */

async function loadStudentDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  
  if (!user || !user.id || user.role !== 'student') {
    console.warn('No student session found');
    return;
  }

  if (user.name) {
    const nameEl = document.getElementById('studentName');
    if (nameEl) nameEl.textContent = user.name;
  }

  try {
    const statsData = await fetch(`/students/${user.id}/dashboard/stats`).then(r => r.json());
    
    if (statsData) {
      const coursesEl = document.getElementById('enrolledCoursesCount');
      if (coursesEl) coursesEl.textContent = statsData.enrolled_courses || 0;
      
      const attendanceEl = document.getElementById('attendancePercentage');
      if (attendanceEl) attendanceEl.textContent = (statsData.attendance_percentage || 0) + '%';
      
      const feeBalanceEl = document.getElementById('feeBalance');
      if (feeBalanceEl) feeBalanceEl.textContent = '$' + (statsData.fee_balance || 0).toLocaleString();
      
      const notifCountEl = document.getElementById('unreadNotifications');
      if (notifCountEl) notifCountEl.textContent = statsData.unread_notifications || 0;

      const circle = document.querySelector('.circle-progress');
      if (circle) {
        const value = Math.round(statsData.attendance_percentage || 0);
        circle.setAttribute('data-value', value);
        let progress = 0;
        const animate = setInterval(() => {
          progress++;
          circle.style.background = `conic-gradient(var(--pastel-mint) ${progress * 3.6}deg, rgba(11,11,11,0.1) 0)`;
          if (progress >= value) clearInterval(animate);
        }, 15);
      }
    }
  } catch (error) {
    console.error('Failed to load student dashboard stats:', error);
  }

  try {
    const courses = await fetch(`/courses/student/${user.id}`).then(r => r.json());
    const coursesList = document.getElementById('enrolledCoursesList');
    if (coursesList && Array.isArray(courses)) {
      coursesList.innerHTML = '';
      courses.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.course_code} - ${c.course_name} (${c.credit_hours} hrs)`;
        coursesList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Failed to load courses:', error);
  }

  try {
    const attendance = await fetch(`/attendance/student/${user.id}`).then(r => r.json());
    const attendanceList = document.getElementById('recentAttendance');
    if (attendanceList && Array.isArray(attendance)) {
      attendanceList.innerHTML = '';
      attendance.slice(0, 5).forEach(a => {
        const li = document.createElement('li');
        li.textContent = `Course ${a.course_id}: ${a.status} (${new Date(a.date).toLocaleDateString()})`;
        li.className = a.status.toLowerCase() === 'present' ? 'present' : 'absent';
        attendanceList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Failed to load attendance:', error);
  }

  try {
    const fees = await fetch(`/fees/student/${user.id}`).then(r => r.json());
    const feesList = document.getElementById('feeRecords');
    if (feesList && Array.isArray(fees)) {
      feesList.innerHTML = '';
      fees.forEach(f => {
        const li = document.createElement('li');
        const balance = (f.total_amount || 0) - (f.amount_paid || 0);
        li.textContent = `Total: $${f.total_amount}, Paid: $${f.amount_paid}, Balance: $${balance} - Status: ${f.status}`;
        li.className = f.status.toLowerCase();
        feesList.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Failed to load fees:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStudentDashboard);
} else {
  loadStudentDashboard();
}
