/* =======================================================
   EDU Track - Courses Script (courses.js)
   Handles course card animations and details display
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector(".data-table tbody") || document.querySelector('#coursesTable tbody');
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

  if (!logged || !logged.id) {
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="5">Please log in to view courses.</td></tr>';
    }
    return;
  }

  const endpoint = (logged.role === 'student') ? `/courses/student/${logged.id}` : '/courses';

  fetch(endpoint)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    })
    .then(data => {
      if (!tableBody) return;
      tableBody.innerHTML = '';
      
      if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No courses available.</td></tr>';
        return;
      }

      data.forEach((course, index) => {
        const tr = document.createElement('tr');
        tr.style.opacity = '0';
        tr.style.transform = 'translateY(10px)';
        tr.innerHTML = `
          <td>${course.course_name}</td>
          <td>${course.course_code}</td>
          <td>${course.credit_hours}</td>
          <td>${course.faculty_id || 'N/A'}</td>
          <td><button class="btn btn-details" data-course-id="${course.course_id}">Details</button></td>
        `;
        tableBody.appendChild(tr);
        
        setTimeout(() => {
          tr.style.transition = '0.3s ease';
          tr.style.opacity = '1';
          tr.style.transform = 'translateY(0)';
        }, index * 100);

        const btn = tr.querySelector('.btn-details');
        if (btn) btn.addEventListener('click', () => {
          if (window.showAlert) showAlert(`Course: ${course.course_name} (${course.course_code}) - ${course.credit_hours} credit hours`, 'info');
        });
      });

      if (logged.role === 'student') {
        const availableCoursesBtn = document.getElementById('viewAvailableCoursesBtn');
        if (availableCoursesBtn) {
          availableCoursesBtn.addEventListener('click', showAvailableCourses);
        }
      }
    })
    .catch((err) => {
      console.error('Failed to load courses:', err);
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5">Failed to load courses. Please try again later.</td></tr>';
      }
    });
});

function showAvailableCourses() {
  fetch('/courses')
    .then(res => res.json())
    .then(courses => {
      const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
      if (!logged || !logged.id) return;

      fetch(`/courses/student/${logged.id}`)
        .then(res => res.json())
        .then(enrolled => {
          const enrolledIds = enrolled.map(c => c.course_id);
          const available = courses.filter(c => !enrolledIds.includes(c.course_id));

          let html = '<h3>Available Courses</h3><ul>';
          available.forEach(c => {
            html += `<li>${c.course_name} (${c.course_code}) - ${c.credit_hours} hrs <button class="btn" onclick="enrollInCourse(${c.course_id})">Enroll</button></li>`;
          });
          html += '</ul>';

          const modal = document.createElement('div');
          modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999';
          modal.innerHTML = `<div style="background:white;padding:30px;border-radius:8px;max-width:600px;max-height:80vh;overflow:auto">${html}<button class="btn" onclick="this.closest('div[style*=fixed]').remove()">Close</button></div>`;
          document.body.appendChild(modal);
        });
    });
}

function enrollInCourse(courseId) {
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  if (!logged || !logged.id) return;

  const payload = {
    student_id: logged.id,
    course_id: courseId,
    semester: logged.semester || 1,
    status: 'Active'
  };

  fetch('/enrollments/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (!res.ok) throw new Error('Enrollment failed');
    return res.json();
  })
  .then(() => {
    if (window.showAlert) showAlert('Successfully enrolled in course!', 'success');
    setTimeout(() => window.location.reload(), 1000);
  })
  .catch(err => {
    console.error('Enrollment error:', err);
    if (window.showAlert) showAlert('Failed to enroll: ' + err.message, 'error');
  });
}
