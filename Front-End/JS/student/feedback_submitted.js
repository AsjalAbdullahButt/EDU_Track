// Feedback Submitted page behavior (extracted from inline)
function downloadAllFeedback() {
  alert('Downloading all submitted feedback as PDF...');
}

function editFeedback(courseCode) {
  alert(`Redirecting to edit feedback for ${courseCode}...`);
  // In real implementation: location.href = `feedback_form.html?course=${courseCode}&edit=true`;
}

function deleteFeedback(courseCode) {
  if (confirm(`Are you sure you want to delete your feedback for ${courseCode}? This action cannot be undone.`)) {
    alert(`Feedback for ${courseCode} deleted successfully.`);
    // In real implementation: API call to delete feedback
  }
}

window.downloadAllFeedback = downloadAllFeedback;
window.editFeedback = editFeedback;
window.deleteFeedback = deleteFeedback;
