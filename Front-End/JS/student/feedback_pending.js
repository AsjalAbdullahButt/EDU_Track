function startFeedback(courseCode) {
  // Redirect to detailed feedback form
  location.href = `feedback_form.html?course=${courseCode}`;
}

function continueFeedback(courseCode) {
  // Redirect to continue draft
  location.href = `feedback_form.html?course=${courseCode}&continue=true`;
}

function viewDraft(courseCode) {
  alert(`Viewing draft for ${courseCode}...`);
  // In real implementation: show draft preview modal
}

function remindLater(courseCode) {
  alert(`Reminder set for ${courseCode}. You'll be notified in 2 days.`);
  // In real implementation: API call to set reminder
}

function submitAllFeedback() {
  if (confirm('Are you sure you want to submit feedback for all pending courses? This will use default ratings for courses without feedback.')) {
    alert('Submitting feedback for all pending courses...');
    // In real implementation: batch submission logic
  }
}

function submitQuickFeedback() {
  const selectedCourses = document.querySelectorAll('input[name="quickCourses"]:checked');
  if (selectedCourses.length === 0) {
    alert('Please select at least one course to submit feedback.');
    return;
  }
  
  alert(`Submitting quick feedback for ${selectedCourses.length} courses...`);
  // In real implementation: process quick feedback submission
}

window.startFeedback = startFeedback;
window.continueFeedback = continueFeedback;
window.viewDraft = viewDraft;
window.remindLater = remindLater;
window.submitAllFeedback = submitAllFeedback;
window.submitQuickFeedback = submitQuickFeedback;
