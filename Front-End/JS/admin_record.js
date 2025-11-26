document.addEventListener('DOMContentLoaded', async () => {
  const table = document.getElementById('reportTable').querySelector('tbody');
  const totalEnrollmentsEl = document.getElementById('totalEnrollments');
  const activeStudentsEl = document.getElementById('activeStudents');
  const completedCountEl = document.getElementById('completedCount');
  const dropoutCountEl = document.getElementById('dropoutCount');

  try {
    const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
      fetch('/enrollments').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/students').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/courses').then(r=>r.ok?r.json():[]).catch(()=>[])
    ]);

    const studentsMap = Object.fromEntries((studentsRes||[]).map(s=>[s.student_id, s.full_name]));
    const coursesMap = Object.fromEntries((coursesRes||[]).map(c=>[c.course_id, c.course_name]));

    const enrollments = enrollmentsRes || [];
    totalEnrollmentsEl.textContent = enrollments.length;

    const uniqueStudents = new Set(enrollments.map(e=>e.student_id));
    activeStudentsEl.textContent = uniqueStudents.size;

    const completed = enrollments.filter(e=> (e.status||'').toLowerCase() === 'completed');
    completedCountEl.textContent = completed.length;

    const dropouts = enrollments.filter(e=> (e.status||'').toLowerCase() === 'dropped' || (e.status||'').toLowerCase() === 'withdrawn');
    dropoutCountEl.textContent = dropouts.length;

    // Populate table
    table.innerHTML = '';
    enrollments.forEach((e, idx) => {
      const tr = document.createElement('tr');
      const studentName = studentsMap[e.student_id] || `#${e.student_id}`;
      const courseName = coursesMap[e.course_id] || `#${e.course_id}`;
      tr.innerHTML = `
        <td data-label="#">${idx+1}</td>
        <td data-label="Student">${studentName}</td>
        <td data-label="Course">${courseName}</td>
        <td data-label="Enrolled On">${e.semester || ''}</td>
        <td data-label="Status"><span class="status-${(e.status||'').toLowerCase()}">${e.status || 'Active'}</span></td>
        <td data-label="Progress">${e.progress || '—'}</td>
      `;
      table.appendChild(tr);
    });

    // Basic search
    const search = document.getElementById('tableSearch');
    search?.addEventListener('input', (ev)=>{
      const q = ev.target.value.toLowerCase();
      Array.from(table.querySelectorAll('tr')).forEach(tr=>{
        const t = tr.textContent.toLowerCase();
        tr.style.display = t.includes(q) ? '' : 'none';
      });
    });

  } catch (err){
    console.error('Failed to load admin records', err);
  }
});