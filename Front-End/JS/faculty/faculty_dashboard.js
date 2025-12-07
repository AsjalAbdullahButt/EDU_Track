/* Faculty Dashboard Data Loader */

async function loadFacultyDashboard() {
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  
  if (!user || !user.id || user.role !== 'faculty') {
    console.warn('No faculty session found');
    return;
  }

  if (user.name) {
    const nameEl = document.getElementById('facultyName');
    if (nameEl) nameEl.textContent = user.name;
  }

  try {
    const statsData = await fetch(`/faculties/${user.id}/dashboard/stats`).then(r => r.json());
    
    if (statsData) {
      const coursesEl = document.getElementById('totalCourses');
      if (coursesEl) coursesEl.textContent = statsData.total_courses || 0;
      
      const studentsEl = document.getElementById('totalStudents');
      if (studentsEl) studentsEl.textContent = statsData.total_students || 0;
      
      const feedbackEl = document.getElementById('pendingFeedback');
      if (feedbackEl) feedbackEl.textContent = statsData.pending_feedback || 0;
    }
  } catch (error) {
    console.error('Failed to load faculty dashboard stats:', error);
  }

  try {
    const courses = await fetch(`/faculties/${user.id}/courses`).then(r => r.json());
    const coursesList = document.getElementById('facultyCoursesList');
    if (coursesList && Array.isArray(courses)) {
      coursesList.innerHTML = '';
      if (courses.length === 0) {
        coursesList.innerHTML = '<li>No courses assigned yet.</li>';
      } else {
        courses.forEach(c => {
          const li = document.createElement('li');
          li.textContent = `${c.course_code} - ${c.course_name} (${c.credit_hours} credit hrs)`;
          coursesList.appendChild(li);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load courses:', error);
  }

  try {
    const feedback = await fetch(`/feedback/faculty/${user.id}`).then(r => r.json());
    const feedbackList = document.getElementById('recentFeedback');
    if (feedbackList && Array.isArray(feedback)) {
      feedbackList.innerHTML = '';
      if (feedback.length === 0) {
        feedbackList.innerHTML = '<li>No feedback received yet.</li>';
      } else {
        feedback.slice(0, 5).forEach(f => {
          const li = document.createElement('li');
          li.textContent = `Course ${f.course_id}: ${f.message} (${new Date(f.date_submitted).toLocaleDateString()})`;
          feedbackList.appendChild(li);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load feedback:', error);
  }

  try {
    const salaries = await fetch(`/salaries/faculty/${user.id}`).then(r => r.json());
    const salaryList = document.getElementById('salaryRecords');
    if (salaryList && Array.isArray(salaries)) {
      salaryList.innerHTML = '';
      if (salaries.length === 0) {
        salaryList.innerHTML = '<li>No salary records available.</li>';
      } else {
        salaries.slice(0, 5).forEach(s => {
          const li = document.createElement('li');
          li.textContent = `$${s.amount} - ${s.status} (${new Date(s.payment_date).toLocaleDateString()})`;
          li.className = s.status.toLowerCase();
          salaryList.appendChild(li);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load salaries:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFacultyDashboard);
} else {
  loadFacultyDashboard();
}
