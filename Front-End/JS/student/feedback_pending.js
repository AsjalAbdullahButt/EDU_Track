// Render pending feedback list for the logged-in student
async function loadPendingFeedbackList(){
  const container = document.getElementById('pendingList');
  if (!container) return;

  const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  if (!session || !session.id) {
    container.innerHTML = '<p>Please login to see pending feedbacks.</p>';
    return;
  }

  try{
    const [enrRes, fbRes, coursesRes] = await Promise.all([fetch('/enrollments/'), fetch('/feedback/'), fetch('/courses/')]);
    if (!enrRes.ok || !coursesRes.ok) throw new Error('Failed to load data');
    const enrollments = await enrRes.json();
    const feedbacks = fbRes.ok ? await fbRes.json() : [];
    const courses = await coursesRes.json();

    // find enrollments for this student
    const myEnroll = (enrollments || []).filter(e => e.student_id === session.id && (e.status || 'Active').toLowerCase() === 'active');
    const submittedCourseIds = new Set((feedbacks||[]).filter(f => f.student_id === session.id).map(f => f.course_id));

    const pending = myEnroll.filter(e => !submittedCourseIds.has(e.course_id));

    if (pending.length === 0){
      container.innerHTML = '<p>No pending feedbacks. Great job!</p>';
      return;
    }

    // build list
    container.innerHTML = '';
    pending.forEach(en => {
      const course = (courses||[]).find(c => c.course_id === en.course_id) || {};
      const row = document.createElement('div');
      row.className = 'pending-item';
      row.innerHTML = `
        <label class="pending-row">
          <input type="checkbox" name="quickCourses" value="${course.course_id}">
          <div class="pending-info"><strong>${course.course_code || ('Course #' + course.course_id)}</strong> — ${course.course_name || ''}</div>
          <div class="pending-actions">
            <button class="btn small" data-course-id="${course.course_id}" data-course-code="${course.course_code || ''}">Start</button>
            <button class="btn small secondary" data-continue-id="${course.course_id}">Remind</button>
          </div>
        </label>
      `;
      container.appendChild(row);
    });

    // attach handlers
    container.querySelectorAll('button[data-course-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = e.currentTarget.dataset.courseId;
        const courseCode = e.currentTarget.dataset.courseCode;
        // navigate to detailed feedback form
        location.href = `feedback_form.html?course=${encodeURIComponent(courseCode)}&course_id=${courseId}`;
      });
    });

    container.querySelectorAll('button[data-continue-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = e.currentTarget.dataset.continueId;
        // set a reminder via notifications API (best-effort)
        fetch('/notifications/', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ sender_id: null, recipient_id: session.id, message: `Reminder set for course ${courseId}`, type: 'reminder' }) }).catch(()=>{});
        if (window.showToast) window.showToast('Reminder set', 'info');
      });
    });

  }catch(err){
    console.error('loadPendingFeedbackList failed', err);
    container.innerHTML = '<p>Unable to load pending feedbacks at this time.</p>';
  }
}

async function submitQuickFeedback(){
  const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  if (!session || !session.id) return showAlert('Please login to submit feedback', 'error');
  const selected = Array.from(document.querySelectorAll('input[name="quickCourses"]:checked')).map(i=>Number(i.value));
  if (selected.length === 0) return showAlert('Please select at least one course', 'error');

  // fetch courses to resolve faculty_id
  const coursesRes = await fetch('/courses/');
  if (!coursesRes.ok) return showAlert('Failed to fetch courses', 'error');
  const courses = await coursesRes.json();

  for (const courseId of selected){
    const course = courses.find(c => c.course_id === courseId) || {};
    const payload = { student_id: session.id, faculty_id: course.faculty_id || null, course_id: courseId, message: 'Quick feedback (auto-submitted).', };
    try{
      const res = await fetch('/feedback/', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) console.warn('quick submit failed for', courseId);
    }catch(e){ console.warn('quick submit error', e); }
  }

  if (window.showToast) window.showToast('Submitted quick feedbacks', 'success');
  // refresh list
  loadPendingFeedbackList();
}

window.addEventListener('DOMContentLoaded', () => loadPendingFeedbackList());

window.submitQuickFeedback = submitQuickFeedback;
