function startFeedback(courseCode) {
  // Redirect to detailed feedback form
  location.href = `feedback_form.html?course=${courseCode}`;
}

function continueFeedback(courseCode) {
  // Redirect to continue draft
  location.href = `feedback_form.html?course=${courseCode}&continue=true`;
}

function viewDraft(courseCode) {
  if (typeof window.showToast === 'function') return window.showToast(`Viewing draft for ${courseCode}...`, 'info');
  if (typeof window.showAlert === 'function') return window.showAlert(`Viewing draft for ${courseCode}...`, 'info');
  // In real implementation: show draft preview modal
}

function remindLater(courseCode) {
  if (typeof window.showToast === 'function') return window.showToast(`Reminder set for ${courseCode}. You'll be notified in 2 days.`, 'info');
  if (typeof window.showAlert === 'function') return window.showAlert(`Reminder set for ${courseCode}. You'll be notified in 2 days.`, 'info');
  // In real implementation: API call to set reminder
}

function submitAllFeedback() {
  // Demo: immediate batch submission (replace with modal confirm later)
  if (typeof window.showToast === 'function') window.showToast('Submitting feedback for all pending courses...', 'info');
  else if (typeof window.showAlert === 'function') window.showAlert('Submitting feedback for all pending courses...', 'info');
  // In real implementation: batch submission logic
}

function submitQuickFeedback() {
  const selectedCourses = document.querySelectorAll('input[name="quickCourses"]:checked');
  if (selectedCourses.length === 0) {
    if (typeof window.showToast === 'function') return window.showToast('Please select at least one course to submit feedback.', 'error');
    if (typeof window.showAlert === 'function') return window.showAlert('Please select at least one course to submit feedback.', 'error');
    return;
  }
  if (typeof window.showToast === 'function') window.showToast(`Submitting quick feedback for ${selectedCourses.length} courses...`, 'info');
  else if (typeof window.showAlert === 'function') window.showAlert(`Submitting quick feedback for ${selectedCourses.length} courses...`, 'info');
  // In real implementation: process quick feedback submission
}

window.startFeedback = startFeedback;
window.continueFeedback = continueFeedback;
window.viewDraft = viewDraft;
window.remindLater = remindLater;
window.submitAllFeedback = submitAllFeedback;
window.submitQuickFeedback = submitQuickFeedback;
