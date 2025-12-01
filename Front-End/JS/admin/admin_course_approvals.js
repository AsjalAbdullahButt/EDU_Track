let allCourses = [];
let allFaculty = {};
let courseRefreshInterval = null;

async function fetchJson(path, opts = {}){
  try{
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates){
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try{
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }catch(e){ console.debug('[fetchJson] candidate failed', url, e.message); }
    }
    throw new Error('All candidates failed');
  }catch(e){
    if (!path.startsWith('http')){
      try{
        const base2 = 'http://127.0.0.1:8000';
        const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
        for (const p of candidates2){
          const fallback = base2 + p;
          try{
            const res2 = await fetch(fallback, opts);
            if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
            return await res2.json();
          }catch(e2){ console.debug('[fetchJson] fallback failed', fallback, e2.message); }
        }
        throw new Error('Fallback candidates failed');
      }catch(e2){
        console.error('[admin_course_approvals] fetchJson failed', path, e, e2);
        if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
        return null;
      }
    }
    console.error('[admin_course_approvals] fetchJson error', path, e);
    return null;
  }
}

async function loadCourses(){
  const [coursesRes, facultyRes] = await Promise.all([
    fetchJson('/courses'),
    fetchJson('/faculties')
  ]);

  allCourses = coursesRes || [];
  allFaculty = Object.fromEntries((facultyRes||[]).map(f=>[f.faculty_id, f.full_name]));

  renderCourseTable();
}

function renderCourseTable(){
  const courseList = document.getElementById('courseList');
  if (!courseList) return;

  courseList.innerHTML = '';
  allCourses.forEach((course, idx) => {
    const row = document.createElement('tr');
    const facultyName = allFaculty[course.faculty_id] || `#${course.faculty_id}`;
    const status = course.course_status || 'Active';
    row.innerHTML = `
      <td data-label="Course ID">${course.course_id}</td>
      <td data-label="Course Title">${course.course_name || '—'}</td>
      <td data-label="Instructor">${facultyName}</td>
      <td data-label="Status"><span class="status-${status.toLowerCase()}">${status}</span></td>
      <td data-label="Actions">
        <button class="btn btn-sm primary" onclick="approveCourse(${course.course_id})">Approve</button>
        <button class="btn btn-sm secondary" onclick="rejectCourse(${course.course_id})">Reject</button>
      </td>
    `;
    courseList.appendChild(row);
  });

  if (allCourses.length === 0){
    courseList.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">No courses found</td></tr>';
  }
}

async function approveCourse(courseId) {
  try{
    await fetchJson(`/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_status: 'Active' })
    });
    window.showToast?.(`Course #${courseId} approved`, 'success');
    await loadCourses();
  }catch(e){
    console.error(e);
    window.showToast?.('Approval failed', 'error');
  }
}

async function rejectCourse(courseId) {
  try{
    await fetchJson(`/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_status: 'Rejected' })
    });
    window.showToast?.(`Course #${courseId} rejected`, 'info');
    await loadCourses();
  }catch(e){
    console.error(e);
    window.showToast?.('Rejection failed', 'error');
  }
}

function startCourseRefresh(intervalMs = 12000){
  if (courseRefreshInterval) clearInterval(courseRefreshInterval);
  courseRefreshInterval = setInterval(() => loadCourses(), intervalMs);
}

function stopCourseRefresh(){
  if (courseRefreshInterval) clearInterval(courseRefreshInterval);
  courseRefreshInterval = null;
}

window.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  startCourseRefresh(12000);

  window.addEventListener('beforeunload', stopCourseRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCourseRefresh();
    else startCourseRefresh(12000);
  });
});

window.approveCourse = approveCourse;
window.rejectCourse = rejectCourse;
