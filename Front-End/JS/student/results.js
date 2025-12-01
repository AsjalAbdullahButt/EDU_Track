document.addEventListener('DOMContentLoaded', () => {
  const session = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  if (!session || !session.id) return;
  const userId = session.id;

  const ring = document.querySelector('.gpa-ring .ring-progress');
  const gpaText = document.querySelector('.gpa-ring .gpa-value');
  const semesterGpaEl = document.getElementById('semesterGpa');

  function animateGpa(gpa){
    const max = 4.0;
    const percent = Math.max(0, Math.min(100, (gpa / max) * 100));
    const circle = ring;
    const r = Number(circle.getAttribute('r')) || 52;
    const circumference = 2 * Math.PI * r;
    circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.2,.9,.3,1)';
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference * (1 - percent / 100);
    // set initial offset for smooth animation
    circle.style.strokeDashoffset = circumference;
    requestAnimationFrame(() => requestAnimationFrame(()=> circle.style.strokeDashoffset = offset));

    // update textual value
    if (gpaText) gpaText.textContent = gpa.toFixed(2);
    if (semesterGpaEl) semesterGpaEl.textContent = gpa.toFixed(2);
  }

  // Try to fetch semester grades (endpoint may differ by backend). Fallback to reading the static table value.
  fetch(`/grades?student_id=${userId}`)
    .then(res => {
      if (!res.ok) throw new Error('no grades');
      return res.json();
    })
    .then(data => {
      // Backend expected to return an array of grade records with semester and points.
      // Compute semester GPA if possible
      if (Array.isArray(data) && data.length){
        // compute simple weighted GPA for current semester (if semester property present)
        const sem = data[0].semester || 'current';
        const semGrades = data.filter(g => (g.semester||'current') === sem);
        let totalPoints = 0, totalCredits = 0;
        semGrades.forEach(g => { totalPoints += (g.points || 0) * (g.credits || 1); totalCredits += (g.credits || 1); });
        const gpa = totalCredits ? (totalPoints / totalCredits) : 0;
        animateGpa(Number(gpa));
      } else {
        throw new Error('no data');
      }
    })
    .catch(() => {
      // Fallback: parse the existing semesterGpa text in the page
      const fallback = document.getElementById('semesterGpa') && parseFloat(document.getElementById('semesterGpa').textContent);
      const gpa = (isNaN(fallback) ? 0 : fallback);
      animateGpa(gpa || 0);
    });

  // Wire Transcript button
  const tBtn = document.getElementById('downloadTranscript');
  if (tBtn) tBtn.addEventListener('click', () => window.location.href = '/pages/student_pages/transcript.html');
});
