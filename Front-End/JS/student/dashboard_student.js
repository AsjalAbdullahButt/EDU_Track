function downloadTranscript() {
  if (typeof window.showToast === 'function') return window.showToast('Transcript download feature coming soon!', 'info');
  if (typeof window.showAlert === 'function') return window.showAlert('Transcript download feature coming soon!', 'info');
}

window.downloadTranscript = downloadTranscript;
