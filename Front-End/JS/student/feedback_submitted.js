// Feedback Submitted page behavior (extracted from inline)
async function downloadAllFeedback() {
  if (typeof window.showToast === 'function') return window.showToast('Downloading all submitted feedback as PDF...', 'info');
  if (typeof window.showAlert === 'function') return window.showAlert('Downloading all submitted feedback as PDF...', 'info');
}

function editFeedback(feedbackId) {
  // navigate to edit form (if implemented)
  location.href = `/pages/student_pages/feedback.html?edit=true&feedback_id=${feedbackId}`;
}

async function deleteFeedback(feedbackId) {
  if (!confirm('Are you sure you want to delete this feedback?')) return;
  try {
    const res = await fetch(`/feedback/${feedbackId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    // remove element from DOM if present
    const el = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
    if (el) el.remove();
    if (typeof window.showToast === 'function') window.showToast('Feedback deleted successfully.', 'success');
    else if (typeof window.showAlert === 'function') window.showAlert('Feedback deleted successfully.', 'success');
  } catch (err) {
    console.error(err);
    showAlert('Failed to delete feedback: ' + (err.message || ''), 'error');
  }
}

// render submitted feedback list for logged in student
window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('submittedFeedbackContainer');
  if (!container) return;
  const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  try {
    const res = await fetch('/feedback');
    if (!res.ok) throw new Error('Could not fetch feedbacks');
    const all = await res.json();
    const mine = session && session.id ? all.filter(f => f.student_id === session.id) : all;
    container.innerHTML = '';
    mine.forEach(f => {
      const item = document.createElement('div');
      item.className = 'feedback-item detailed';
      item.setAttribute('data-feedback-id', f.feedback_id);
      const date = new Date(f.date_submitted).toLocaleString();
      item.innerHTML = `
        <div class="feedback-header">
          <div class="course-info">
            <span class="course-badge">${f.course_id || 'N/A'}</span>
            <div class="course-details">
              <h3>${f.course_id || 'Course'}</h3>
              <p>${f.faculty_id || 'Faculty'} • ${date}</p>
            </div>
          </div>
          <div class="feedback-meta">
            <div class="rating-display">
              <span class="rating-stars">${f.rating ? '★'.repeat(Math.round(f.rating)) : ''}</span>
            </div>
            <span class="submission-date">Submitted: ${date}</span>
          </div>
        </div>
        <div class="feedback-details">
          <div class="feedback-comments"><div class="comment-section"><p>${(f.message||'').substring(0,100)}</p></div></div>
        </div>
        <div class="feedback-actions">
          <button class="btn-text" onclick="editFeedback(${f.feedback_id})">Edit Feedback</button>
          <button class="btn-text" onclick="deleteFeedback(${f.feedback_id})">Delete</button>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error('Failed to load submitted feedbacks', err);
    container.innerHTML = '<p>Unable to load feedback at this time.</p>';
  }
});

window.downloadAllFeedback = downloadAllFeedback;
window.editFeedback = editFeedback;
window.deleteFeedback = deleteFeedback;
