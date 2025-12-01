// Feedback modal & animations script (improved)

function startNewFeedback() {
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
  // focus course select after a short delay
  setTimeout(()=> document.getElementById('courseSelect') && document.getElementById('courseSelect').focus(), 80);
  // enable trapping
  document.addEventListener('keydown', modalKeyHandler);
}

function closeNewFeedbackModal() {
  const modal = document.getElementById('newFeedbackModal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
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
document.addEventListener('submit', function(e){
  if (e.target && e.target.id === 'newFeedbackForm'){
    e.preventDefault();
    const form = e.target;
    const course = form.course.value;
    const message = form.message.value.trim();
    const rating = Number((document.getElementById('ratingValue') && document.getElementById('ratingValue').value) || 0);
    const anonymous = document.getElementById('anonymousCheck') && document.getElementById('anonymousCheck').checked;
    if (!course || !message) return toast('Please select a course and write feedback.', 'error');

    const submitBtn = form.querySelector('button[type=submit]');
    const origText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

    const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const payload = {
      student_id: session.id,
      course_code: course,
      message: message,
      rating: rating || null,
      anonymous: !!anonymous
    };

    fetch('/feedback', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      .then(async res => {
        if (!res.ok) {
          const txt = await res.text().catch(()=>null);
          throw new Error(txt || 'Server error');
        }
        return res.json().catch(()=>null);
      })
      .then(data => {
        // Append to timeline (use server-returned data when available)
        try {
          const list = document.querySelector('.activity-timeline');
          if (list){
            const item = document.createElement('div'); item.className = 'timeline-item is-visible';
            const marker = document.createElement('div'); marker.className = 'timeline-marker pending';
            const content = document.createElement('div'); content.className = 'timeline-content';
            const title = data && data.course_code ? data.course_code : course;
            const dt = (new Date()).toLocaleString();
            content.innerHTML = `<div class="timeline-header"><span class="course-badge">${title}</span><span class="timeline-date">${dt}</span></div><h4>${title}</h4><p>Submitted feedback ${rating ? 'with '+rating+'⭐ rating':''}</p><div class="timeline-preview">${message.substring(0,200)}</div>`;
            item.appendChild(marker); item.appendChild(content);
            list.insertBefore(item, list.firstChild);
          }
        } catch (err) { console.warn('append timeline failed', err); }

        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
        closeNewFeedbackModal();
        toast('Thank you — your feedback was submitted.', 'success');
      })
      .catch(err => {
        console.error('Feedback submit failed', err);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
        toast('Failed to submit feedback: ' + (err.message || 'Server error'), 'error');
      });
  }
});

window.startNewFeedback = startNewFeedback;
window.closeNewFeedbackModal = closeNewFeedbackModal;
window.downloadFeedbackHistory = downloadFeedbackHistory;
