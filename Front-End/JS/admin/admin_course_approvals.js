// Admin Course Approvals behavior (extracted from inline)
const coursesData = [];

function populateCourseTable() {
  const courseList = document.getElementById('courseList');
  fetch('/courses').then(r=>r.json()).then(courses=>{
    coursesData.length = 0;
    courses.forEach(c => coursesData.push(c));
    courseList.innerHTML = '';
    courses.forEach(course=>{
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${course.course_id}</td>
        <td>${course.course_name}</td>
        <td>${course.faculty_id || ''}</td>
        <td>Active</td>
        <td>
          <button onclick="approveCourse(${course.course_id})">Approve</button>
          <button onclick="rejectCourse(${course.course_id})">Reject</button>
        </td>
      `;
      courseList.appendChild(row);
    });
  }).catch(err => console.error('Failed to load courses:', err));
}

function approveCourse(id) { 
  showAlert('Approved '+id, 'success'); 
}

function rejectCourse(id) { 
  showAlert('Rejected '+id, 'warning'); 
}

window.addEventListener('load', populateCourseTable);
window.approveCourse = approveCourse;
window.rejectCourse = rejectCourse;
