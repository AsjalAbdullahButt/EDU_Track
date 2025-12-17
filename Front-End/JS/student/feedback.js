// Feedback modal & animations script (improved)

async function startNewFeedback() {
  const modal = document.getElementById('newFeedbackModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  // reset form
  const form = document.getElementById('newFeedbackForm');
  if (form) form.reset();
  // reset stars
  document.querySelectorAll('#ratingStars .star').forEach(s => { s.classList.remove('active'); s.setAttribute('aria-checked','false'); });
  const hidden = document.getElementById('ratingValue'); if (hidden) hidden.value = 0;
  const live = document.getElementById('feedbackLive'); if (live) live.textContent = '';
  // store previously focused element for return-focus
  modal.__previouslyFocused = document.activeElement;

  // Fetch and populate registered subjects for the logged-in student
  try {
    const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const studentId = session && session.id;
    const select = document.getElementById('courseSelect');
    if (studentId && select) {
      select.innerHTML = '<option value="">Select a course...</option>';
      const res = await fetch(`/courses/student/${studentId}`);
      if (res.ok) {
        const courses = await res.json();
        courses.forEach(course => {
          const opt = document.createElement('option');
          opt.value = course.course_id;
          opt.textContent = `${course.course_code} - ${course.course_name}`;
          select.appendChild(opt);
        });
      } else {
        select.innerHTML = '<option value="">No registered subjects found</option>';
      }
    }
  } catch (err) {
    console.warn('Failed to load registered subjects', err);
    const select = document.getElementById('courseSelect');
    if (select) select.innerHTML = '<option value="">Error loading subjects</option>';
  }

  // focus course select after a short delay
  setTimeout(()=> document.getElementById('courseSelect') && document.getElementById('courseSelect').focus(), 80);
  // enable trapping
  document.addEventListener('keydown', modalKeyHandler);
  // apply panel style so it slides in from the right on wide screens
  modal.classList.add('panel');
}

function closeNewFeedbackModal() {
  const modal = document.getElementById('newFeedbackModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('panel');
  // restore focus
  try{ if (modal.__previouslyFocused && modal.__previouslyFocused.focus) modal.__previouslyFocused.focus(); }catch(e){}
  document.removeEventListener('keydown', modalKeyHandler);
}

function downloadFeedbackHistory() {
  toast('Feedback history download feature coming soon!', 'info');
}

// Close modal when clicking outside
function handleModalClick(event) {
  const modal = document.getElementById('newFeedbackModal');
  if (event.target === modal) {
    closeNewFeedbackModal();
  }
}

// keyboard handler to trap focus and allow ESC to close
function modalKeyHandler(e){
  const modal = document.getElementById('newFeedbackModal');
  if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
  // ESC closes
  if (e.key === 'Escape' || e.key === 'Esc'){
    e.preventDefault(); closeNewFeedbackModal(); return;
  }
  if (e.key === 'Tab'){
    // trap focus
    const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey){ // shift + tab
      if (document.activeElement === first){ e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }
}

// Use global toast if available, otherwise fallback to showAlert or console
function toast(message, type='info'){
  try{
    if (typeof window.showToast === 'function') return window.showToast(message, type);
    if (typeof window.showAlert === 'function') return window.showAlert(message, type);
  } catch(e){}
  console.log('[toast]', type, message);
}

window.addEventListener('load', function() {
  const modal = document.getElementById('newFeedbackModal');
  if (modal) {
    modal.addEventListener('click', handleModalClick);
  }
  // Animate feedback page elements with a staggered reveal
  try {
    const statCards = Array.from(document.querySelectorAll('.feedback-stats .stat-card'));
    const actionCards = Array.from(document.querySelectorAll('.actions-grid .action-card, .actions-grid .action-btn'));
    const timeline = Array.from(document.querySelectorAll('.activity-timeline .timeline-item'));
    const guidelines = document.querySelector('.guidelines-card');

    function stagger(elems, cls='is-visible', delay=80) {
      elems.forEach((el, i) => {
        el.classList.add('stagger-hide');
        setTimeout(() => el.classList.add(cls), 120 + i * delay);
        setTimeout(() => el.classList.remove('stagger-hide'), 120 + i * delay + 220);
      });
    }

    if (statCards.length) stagger(statCards, 'is-visible', 90);
    if (actionCards.length) stagger(actionCards, 'is-visible', 70);
    if (timeline.length) stagger(timeline, 'is-visible', 120);
    if (guidelines) setTimeout(() => guidelines.classList && guidelines.classList.add('is-visible'), 400);
  } catch (e) {
    console.warn('Feedback animation init failed', e);
  }
});

// Update feedback overview stats (total submitted, average rating if available, pending feedbacks)
async function updateFeedbackStats(){
  try{
    const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    // Fetch all feedbacks and enrollments
    const [allFeedbacksRes, enrollRes] = await Promise.all([fetch('/feedback'), fetch('/enrollments')]);
    if (!allFeedbacksRes.ok) throw new Error('Failed to load feedbacks');
    if (!enrollRes.ok) throw new Error('Failed to load enrollments');
    const allFeedbacks = await allFeedbacksRes.json();
    const enrollments = await enrollRes.json();

    // Filter by current student if session present
    const myId = session && session.id ? session.id : null;
    const myFeedbacks = myId ? allFeedbacks.filter(f => f.student_id === myId) : allFeedbacks;

    const submittedCount = myFeedbacks.length;
    // average rating if present on items
    const ratings = myFeedbacks.map(f => Number(f.rating)).filter(r => !isNaN(r) && r > 0);
    const avg = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length) : null;

    // pending = enrolled courses for this student that don't have feedback yet
    let pending = 0;
    if (myId){
      const myEnroll = enrollments.filter(e => e.student_id === myId);
      const enrolledCourseIds = new Set(myEnroll.map(e=>e.course_id));
      const submittedCourseIds = new Set(myFeedbacks.map(f=>f.course_id));
      pending = Array.from(enrolledCourseIds).filter(cid => !submittedCourseIds.has(cid)).length;
    }

    // update DOM if elements exist
    const elCount = document.getElementById('feedbackCount'); if (elCount) elCount.textContent = submittedCount;
    const elAvg = document.getElementById('feedbackAverage'); if (elAvg) elAvg.textContent = avg ? (Math.round(avg*10)/10) : '—';
    const elPend = document.getElementById('feedbackPending'); if (elPend) elPend.textContent = pending;
    const cardPend = document.getElementById('cardPendingCount'); if (cardPend) cardPend.textContent = pending;
    const cardTot = document.getElementById('cardTotalCount'); if (cardTot) cardTot.textContent = submittedCount;
    const pendingCountSmall = document.getElementById('pendingCount'); if (pendingCountSmall) pendingCountSmall.textContent = pending;
    const totalSubmittedSmall = document.getElementById('totalSubmittedCount'); if (totalSubmittedSmall) totalSubmittedSmall.textContent = submittedCount;
  }catch(err){
    console.warn('updateFeedbackStats failed', err);
  }
}

// Call update on load
document.addEventListener('DOMContentLoaded', () => {
  try{ updateFeedbackStats(); }catch(e){}
});

// Load recent feedback timeline for the logged-in student
async function loadMyFeedbackTimeline(){
  try{
    const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const myId = session && session.id ? session.id : null;
    const list = document.querySelector('.activity-timeline');
    if (!list) return;
    list.innerHTML = '';
    const res = await fetch('/feedback');
    if (!res.ok) return;
    const all = await res.json();
    const my = myId ? all.filter(f=>f.student_id === myId) : all;
    if (!my || my.length === 0){
      const empty = document.createElement('div'); empty.className='timeline-empty'; empty.textContent = 'No feedback submitted yet.';
      list.appendChild(empty); return;
    }
    // sort by date_submitted desc if available
    my.sort((a,b)=> new Date(b.date_submitted) - new Date(a.date_submitted));
    my.forEach(f => {
      const item = document.createElement('div'); item.className = 'timeline-item is-visible';
      const marker = document.createElement('div'); marker.className = 'timeline-marker completed';
      const content = document.createElement('div'); content.className = 'timeline-content';
      const title = f.course_code || f.course_id || 'Course';
      const dt = f.date_submitted ? (new Date(f.date_submitted)).toLocaleString() : '';
      content.innerHTML = `<div class="timeline-header"><span class="course-badge">${title}</span><span class="timeline-date">${dt}</span></div><h4>${f.course_name || ''}</h4><p>${f.rating ? 'Submitted feedback with '+f.rating+'⭐ rating' : 'Submitted feedback'}</p><div class="timeline-preview">${(f.message||'').substring(0,200)}</div>`;
      item.appendChild(marker); item.appendChild(content); list.appendChild(item);
    });
  }catch(err){ console.warn('loadMyFeedbackTimeline failed', err); }
}

// also call timeline loader on DOM ready
document.addEventListener('DOMContentLoaded', () => { try{ loadMyFeedbackTimeline(); }catch(e){} });

// Rating star handlers
document.addEventListener('click', function(e){
  if (e.target && e.target.matches('#ratingStars .star')){
    const val = Number(e.target.dataset.value || 0);
    const stars = Array.from(document.querySelectorAll('#ratingStars .star'));
    stars.forEach(s => {
      const v = Number(s.dataset.value || 0);
      const active = v <= val;
      s.classList.toggle('active', active);
      s.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    // store value on form
    const hidden = document.getElementById('ratingValue');
    if (hidden) hidden.value = val;
    // announce change for screen readers
    const live = document.getElementById('feedbackLive');
    if (live) live.textContent = val ? `Rating set to ${val} out of 5` : 'Rating cleared';
  }
});

// keyboard support for star rating (arrow keys + enter/space)
document.addEventListener('keydown', function(e){
  const target = e.target;
  if (!target || !target.matches || !target.matches('#ratingStars .star')) return;
  const stars = Array.from(document.querySelectorAll('#ratingStars .star'));
  const idx = stars.indexOf(target);
  if (idx === -1) return;

  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp'){
    e.preventDefault();
    const prev = stars[Math.max(0, idx - 1)]; if (prev) prev.focus();
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown'){
    e.preventDefault();
    const next = stars[Math.min(stars.length - 1, idx + 1)]; if (next) next.focus();
  } else if (e.key === 'Home'){
    e.preventDefault(); stars[0].focus();
  } else if (e.key === 'End'){
    e.preventDefault(); stars[stars.length - 1].focus();
  } else if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space'){
    e.preventDefault(); target.click();
  }
});

// Handle new feedback submit (send to backend)
document.addEventListener('submit', async function(e){
  if (!(e.target && e.target.id === 'newFeedbackForm')) return;
  e.preventDefault();
  const form = e.target;
  const courseId = Number(form.course.value);
  const message = form.message.value.trim();
  const rating = Number((document.getElementById('ratingValue') && document.getElementById('ratingValue').value) || 0);
  const anonymous = document.getElementById('anonymousCheck') && document.getElementById('anonymousCheck').checked;
  if (!courseId || !message) return toast('Please select a course and write feedback.', 'error');

  const submitBtn = form.querySelector('button[type=submit]');
  const origText = submitBtn ? submitBtn.textContent : null;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  try {
    // Fetch course details by id to get faculty mapping
    const courseRes = await fetch(`/courses/${courseId}`);
    if (!courseRes.ok) throw new Error('Selected course not found on server');
    const matched = await courseRes.json();

    const payload = {
      student_id: session.id,
      faculty_id: matched.faculty_id || matched.faculty || null,
      course_id: matched.course_id,
      message: message,
      rating: rating
    };

    const feedbackRes = await fetch('/feedback', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    if (!feedbackRes.ok) {
      const txt = await feedbackRes.text().catch(()=>null);
      throw new Error(txt || 'Server error');
    }
    const data = await feedbackRes.json().catch(()=>null);

    // Append to timeline (use server-returned data when available)
    try {
      const list = document.querySelector('.activity-timeline');
      if (list){
        const item = document.createElement('div'); item.className = 'timeline-item is-visible';
        const marker = document.createElement('div'); marker.className = 'timeline-marker pending';
        const content = document.createElement('div'); content.className = 'timeline-content';
        const title = (data && data.course_id && data.course_code) ? data.course_code : (matched.course_code || matched.course_name || 'Course');
        const dt = (new Date()).toLocaleString();
        content.innerHTML = `<div class="timeline-header"><span class="course-badge">${title}</span><span class="timeline-date">${dt}</span></div><h4>${title}</h4><p>Submitted feedback ${rating ? 'with '+rating+'⭐ rating':''}</p><div class="timeline-preview">${message.substring(0,200)}</div>`;
        item.appendChild(marker); item.appendChild(content);
        list.insertBefore(item, list.firstChild);
      }
    } catch (err) { console.warn('append timeline failed', err); }

    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
    closeNewFeedbackModal();
    toast('Thank you — your feedback was submitted.', 'success');
  } catch (err) {
    console.error('Feedback submit failed', err);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
    toast('Failed to submit feedback: ' + (err.message || 'Server error'), 'error');
  }
});

window.startNewFeedback = startNewFeedback;
window.closeNewFeedbackModal = closeNewFeedbackModal;
window.downloadFeedbackHistory = downloadFeedbackHistory;
