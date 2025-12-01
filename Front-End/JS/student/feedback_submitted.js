// Feedback Submitted page behavior (extracted from inline)
function downloadAllFeedback() {
  if (typeof window.showToast === 'function') return window.showToast('Downloading all submitted feedback as PDF...', 'info');
  if (typeof window.showAlert === 'function') return window.showAlert('Downloading all submitted feedback as PDF...', 'info');
}

function editFeedback(courseCode) {
  if (typeof window.showToast === 'function') return window.showToast(`Redirecting to edit feedback for ${courseCode}...`, 'info');
  if (typeof window.showAlert === 'function') return window.showAlert(`Redirecting to edit feedback for ${courseCode}...`, 'info');
  // In real implementation: location.href = `feedback_form.html?course=${courseCode}&edit=true`;
}

function deleteFeedback(courseCode) {
  // Replace native confirm with a friendly toast for now
  if (typeof window.showToast === 'function') window.showToast(`Feedback for ${courseCode} deleted successfully. (demo)`, 'success');
  else if (typeof window.showAlert === 'function') window.showAlert(`Feedback for ${courseCode} deleted successfully. (demo)`, 'success');
  // In real implementation: API call to delete feedback with server confirmation
}

window.downloadAllFeedback = downloadAllFeedback;
window.editFeedback = editFeedback;
window.deleteFeedback = deleteFeedback;
