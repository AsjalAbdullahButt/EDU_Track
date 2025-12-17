document.addEventListener('DOMContentLoaded', ()=>{
  const cf = document.getElementById('courseFilter');
  const rf = document.getElementById('ratingFilter');
  if(cf) cf.addEventListener('change', filterFeedback);
  if(rf) rf.addEventListener('change', filterFeedback);
  loadFeedbackList();
});

async function loadFeedbackList(){
  const tbody = document.getElementById('feedbackTableBody');
  if(!tbody) return;
  const session = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  try{
    const res = await fetch('/feedback');
    if(!res.ok) throw new Error('Failed');
    const all = await res.json();
    // If logged-in faculty, show only their feedback
    const mine = session && session.role === 'faculty' && session.id ? all.filter(f => f.faculty_id === session.id) : all;
    tbody.innerHTML = '';
    mine.forEach(f => {
      const tr = document.createElement('tr');
      const courseName = f.course_name || f.course_code || f.course || `Course ${f.course_id}`;
      const rating = f.rating || '';
      const msg = (f.message || '').replace(/\n/g, ' ');
      tr.innerHTML = `<td>${courseName}</td><td>${rating}</td><td>${msg}</td>`;
      tbody.appendChild(tr);
    });
    filterFeedback();
  }catch(e){
    console.error('loadFeedbackList failed', e);
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#666;padding:14px;">Unable to load feedback.</td></tr>';
  }
}

function filterFeedback(){
  const course = (document.getElementById('courseFilter')?.value || '').toLowerCase();
  const rating = document.getElementById('ratingFilter')?.value;
  const tbody = document.getElementById('feedbackTableBody');
  if(!tbody) return;
  for(const row of Array.from(tbody.children)){
    const rowCourse = (row.cells[0]?.innerText || '').toLowerCase();
    const rowRating = row.cells[1]?.innerText;
    let show = true;
    if(course && rowCourse.indexOf(course) === -1) show = false;
    if(rating && rowRating !== rating) show = false;
    row.style.display = show ? '' : 'none';
  }
}

window.filterFeedback = filterFeedback;
