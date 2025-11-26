function startNewFeedback() {
  document.getElementById('newFeedbackModal').style.display = 'block';
}

function closeNewFeedbackModal() {
  document.getElementById('newFeedbackModal').style.display = 'none';
}

function downloadFeedbackHistory() {
  alert('Feedback history download feature coming soon!');
}

// Close modal when clicking outside
function handleModalClick(event) {
  const modal = document.getElementById('newFeedbackModal');
  if (event.target === modal) {
    closeNewFeedbackModal();
  }
}

window.addEventListener('load', function() {
  const modal = document.getElementById('newFeedbackModal');
  if (modal) {
    window.onclick = handleModalClick;
  }
});

window.startNewFeedback = startNewFeedback;
window.closeNewFeedbackModal = closeNewFeedbackModal;
window.downloadFeedbackHistory = downloadFeedbackHistory;
