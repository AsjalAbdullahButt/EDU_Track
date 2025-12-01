/* =======================================================
   EDU Track - Dashboard Script (dashboard.js)
   Handles sidebar interactivity and user session control.
   ======================================================= */

// Show logged-in user's name (if available)
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const header = document.querySelector(".dashboard-header");

  if (user && header) {
    // Update welcome name if an element with id `studentName` exists
    const nameSpan = header.querySelector('[data-user-name]') || header.querySelector('#studentName');
    if (nameSpan) nameSpan.textContent = user.name || nameSpan.textContent;

    // Add avatar / photo upload UI (if not already present)
    if (!header.querySelector('.user-photo')) {
      const photoWrap = document.createElement('div');
      photoWrap.className = 'user-photo';
      photoWrap.style.display = 'flex';
      photoWrap.style.alignItems = 'center';
      photoWrap.style.gap = '12px';

      const img = document.createElement('img');
      img.src = '';
      img.alt = 'avatar';
      img.style.width = '48px';
      img.style.height = '48px';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      img.style.background = '#f0f0f0';

      const uploadBtn = document.createElement('button');
      uploadBtn.className = 'btn secondary';
      uploadBtn.textContent = 'Upload Photo';

      // Add 'Your Profile' button for students next to upload button
      let profileBtn = null;
      try {
        if (user && user.role === 'student') {
          profileBtn = document.createElement('button');
          profileBtn.className = 'btn secondary';
          profileBtn.id = 'yourProfileBtn';
          profileBtn.textContent = 'Your Profile';
          profileBtn.addEventListener('click', () => {
            window.location.href = '/pages/dashboard/student/profile.html';
          });
        }
      } catch (err) {
        console.warn('Could not create profile button', err);
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      // Load saved avatar (stored in loggedInUser.photo or separate key)
      const saved = user.photo || localStorage.getItem(`userAvatar_${user.role}_${user.id}`);
      if (saved) img.src = saved;

      uploadBtn.addEventListener('click', () => input.click());
      input.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          img.src = ev.target.result;
          // persist avatar for this user key
          try {
            localStorage.setItem(`userAvatar_${user.role}_${user.id}`, ev.target.result);
            // also update loggedInUser object for quick usage
            const session = JSON.parse(localStorage.getItem('loggedInUser')) || {};
            session.photo = ev.target.result;
            localStorage.setItem('loggedInUser', JSON.stringify(session));
          } catch (err) {
            console.warn('Could not persist avatar:', err);
          }
        };
        reader.readAsDataURL(f);
      });

      photoWrap.appendChild(img);
      if (profileBtn) photoWrap.appendChild(profileBtn);
      photoWrap.appendChild(uploadBtn);
      photoWrap.appendChild(input);

      // insert at top-right of header
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.appendChild(photoWrap);
    }
  }
});

// Logout function (called by button)
function logout() {
  localStorage.removeItem("loggedInUser");
  showAlert("You have been logged out.", 'info');
  // Redirect to the login page relative to dashboard pages
  window.location.href = "../login.html";
}

// Active link highlight
const navLinks = document.querySelectorAll(".nav-links a");
if (navLinks && navLinks.length) {
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href && window.location.href.includes(href)) {
      link.classList.add("active");
    }
  });
}

// --- Page-specific initializers -------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  try {
    initAdminFeeVerification();
    initAdminUserManagement();
    initFacultyManageAttendance();
    initFacultyAnnouncements();
    initFacultyGrades();
    initFacultyViewFeedback();
  } catch (e) {
    // fail silently to avoid breaking dashboard UI
    console.error('Page init error', e);
  }
});

// Admin: Fee Verification
function initAdminFeeVerification() {
  const list = document.getElementById('feeVerificationList');
  if (!list) return;

  // Fetch fees and render rows
  fetch('/fees')
    .then(res => res.json())
    .then(data => {
      list.innerHTML = '';
      data.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${f.student_id}</td>
          <td>${f.student ? f.student.full_name : ''}</td>
          <td>${f.total_amount}</td>
          <td>${f.method || 'N/A'}</td>
          <td><button class="btn" data-receipt="${f.fee_id}">View</button></td>
          <td class="status">${f.status}</td>
          <td>
            <button class="btn primary approve" data-id="${f.fee_id}">Approve</button>
            <button class="btn danger reject" data-id="${f.fee_id}">Reject</button>
          </td>
        `;
        list.appendChild(tr);
      });

      // Attach handlers
      list.querySelectorAll('.approve').forEach(btn => {
        btn.addEventListener('click', (e) => updateFeeStatus(e.target.dataset.id, 'Approved'));
      });
      list.querySelectorAll('.reject').forEach(btn => {
        btn.addEventListener('click', (e) => updateFeeStatus(e.target.dataset.id, 'Rejected'));
      });
    });
}

function updateFeeStatus(feeId, status) {
  // Fetch current fee, modify status and PUT
  fetch(`/fees/${feeId}`)
    .then(r => r.json())
    .then(fee => {
      const payload = {
        student_id: fee.student_id,
        total_amount: fee.total_amount,
        amount_paid: fee.amount_paid ?? 0,
        due_date: fee.due_date ?? null,
        status: status
      };
      return fetch(`/fees/${feeId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    })
    .then(r => {
      if (!r.ok) throw new Error('Failed');
      showAlert('Fee status updated', 'success');
      initAdminFeeVerification();
    })
    .catch(err => { console.error(err); showAlert('Update failed', 'error'); });
}

// Admin: User management (students + faculties)
function initAdminUserManagement() {
  const container = document.getElementById('userManagementList') || document.getElementById('userList');
  if (!container) return;

  Promise.all([fetch('/students').then(r=>r.json()), fetch('/faculties').then(r=>r.json())])
    .then(([students, faculties]) => {
      container.innerHTML = '<h3>Students</h3>';
      const sTable = document.createElement('table');
      sTable.innerHTML = '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr></thead><tbody>' +
        students.map(s => `<tr><td>${s.student_id}</td><td>${s.full_name}</td><td>${s.email}</td><td><button class="del-student" data-id="${s.student_id}">Delete</button></td></tr>`).join('') +
        '</tbody>';
      container.appendChild(sTable);

      container.appendChild(document.createElement('hr'));
      const fTitle = document.createElement('h3'); fTitle.textContent = 'Faculties'; container.appendChild(fTitle);
      const fTable = document.createElement('table');
      fTable.innerHTML = '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr></thead><tbody>' +
        faculties.map(f => `<tr><td>${f.faculty_id}</td><td>${f.name}</td><td>${f.email}</td><td><button class="del-fac" data-id="${f.faculty_id}">Delete</button></td></tr>`).join('') +
        '</tbody>';
      container.appendChild(fTable);

      container.querySelectorAll('.del-student').forEach(b => b.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (!confirm('Delete student?')) return;
        fetch(`/students/${id}`, { method: 'DELETE' }).then(()=> initAdminUserManagement());
      }));
      container.querySelectorAll('.del-fac').forEach(b => b.addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (!confirm('Delete faculty?')) return;
        fetch(`/faculties/${id}`, { method: 'DELETE' }).then(()=> initAdminUserManagement());
      }));
    })
    .catch(err => console.error('User mgmt load failed', err));
}

// Faculty: Manage Attendance
function initFacultyManageAttendance() {
  const table = document.querySelector('#attendanceTable');
  if (!table) return;

  const courseSelect = document.getElementById('courseSelect');
  const dateInput = document.getElementById('attendanceDate');
  const tbody = table.querySelector('tbody');

  // Load courses and enrollments when course or date changes
  function load() {
    const courseName = courseSelect.value;
    const date = dateInput.value;
    if (!date) return;

    // Map course name to course_id by fetching courses
    fetch('/courses').then(r=>r.json()).then(courses => {
      const course = courses.find(c=> courseName.includes(c.course_name) || courseName.includes(c.course_code));
      if (!course) return; const courseId = course.course_id;

      // get enrollments and students
      fetch('/enrollments').then(r=>r.json()).then(enrolls => {
        const studentIds = enrolls.filter(e=>e.course_id===courseId).map(e=>e.student_id);
        Promise.all(studentIds.map(id => fetch(`/students/${id}`).then(r=>r.json())))
          .then(students => {
            tbody.innerHTML = '';
            students.forEach((s, idx) => {
              const tr = document.createElement('tr');
              tr.innerHTML = `<td>${s.student_id}</td><td>${s.full_name}</td><td><button class="toggle" data-idx="${idx}">Absent</button></td>`;
              tbody.appendChild(tr);
              tr.querySelector('.toggle').addEventListener('click', (e)=>{
                const btn = e.target; btn.textContent = btn.textContent === 'Present' ? 'Absent' : 'Present';
                btn.style.background = btn.textContent === 'Present' ? '#27ae60' : '#001f3f';
              });
            });
            // add Save button
            if (!document.getElementById('saveAttendanceBtn')) {
              const save = document.createElement('button'); save.id='saveAttendanceBtn'; save.className='btn primary'; save.textContent='Save Attendance';
              table.parentElement.insertBefore(save, table.nextSibling);
              save.addEventListener('click', saveAttendance);
            }
          });
      });
    });
  }

  function saveAttendance(){
  const date = dateInput.value; if(!date) return showAlert('Select date','warning');
    const courseName = courseSelect.value;
    fetch('/courses').then(r=>r.json()).then(courses => {
      const course = courses.find(c=> courseName.includes(c.course_name) || courseName.includes(c.course_code));
      if (!course) return showAlert('Course not found','warning');
      const courseId = course.course_id;
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const promises = rows.map(r=>{
        const studentId = Number(r.cells[0].textContent);
        const status = r.querySelector('.toggle').textContent;
        const payload = { student_id: studentId, course_id: courseId, date: date, status: status };
        return fetch('/attendance', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      });
      Promise.all(promises).then(()=> showAlert('Attendance saved','success'));
    });
  }

  courseSelect.addEventListener('change', load);
  dateInput.addEventListener('change', load);
}

// Faculty: Announcements (create notifications)
function initFacultyAnnouncements(){
  const form = document.querySelector('#announcementForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const message = form.querySelector('textarea[name=message]').value;
    const payload = { message, type: 'announcement' };
    fetch('/notifications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      .then(r=>{ if(r.ok) { showAlert('Announcement posted','success'); form.reset(); } else showAlert('Post failed','error'); });
  });
}

// Faculty: Grades entry
function initFacultyGrades(){
  const gradeTable = document.querySelector('#facultyGradesTable');
  if (!gradeTable) return;
  // populate assignments using enrollments + students
  fetch('/enrollments').then(r=>r.json()).then(enrolls => {
    // naive: show all enrollments
    gradeTable.querySelector('tbody').innerHTML = enrolls.map(e=>`<tr><td>${e.enrollment_id}</td><td>${e.student_id}</td><td><input class="marks" data-enroll="${e.enrollment_id}"/></td><td><input class="grade" data-enroll="${e.enrollment_id}"/></td><td><button class="save" data-enroll="${e.enrollment_id}">Save</button></td></tr>`).join('');
    gradeTable.querySelectorAll('.save').forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.enroll;
      const marks = gradeTable.querySelector(`.marks[data-enroll="${id}"]`).value;
      const grade = gradeTable.querySelector(`.grade[data-enroll="${id}"]`).value;
      // need student_id and course_id from enrollment
      const enroll = enrolls.find(x=>x.enrollment_id==id);
      if (!enroll) return;
      const payload = { student_id: enroll.student_id, course_id: enroll.course_id, marks_obtained: marks || null, grade: grade || null };
      fetch('/grades', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(r=>{ if(r.ok) showAlert('Saved','success'); else showAlert('Save failed','error'); });
    }));
  });
}

// Faculty: View feedback
function initFacultyViewFeedback() {
  const container = document.getElementById('feedbackList');
  if (!container) return;
  fetch('/feedback').then(r=>r.json()).then(data => {
    container.innerHTML = data.map(f=>`<div class="fb"><strong>From:</strong> ${f.student_id} <br/> <strong>Course:</strong> ${f.course_id} <p>${f.message}</p></div>`).join('');
  });
}
