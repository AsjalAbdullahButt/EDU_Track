// Fee Records page behavior (extracted from inline)
let feeData = [];
let studentsMap = {};

function monthName(dateStr){
  if(!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { month: 'long' });
}

function renderFees(list){
  const tbody = document.getElementById('feeList');
  tbody.innerHTML = '';
  list.forEach(f => {
    const name = studentsMap[f.student_id] || `#${f.student_id}`;
    const month = monthName(f.due_date);
    const status = f.status || ( (Number(f.amount_paid||0) >= Number(f.total_amount||0)) ? 'Paid' : 'Missing');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.student_id}</td>
      <td>${name}</td>
      <td>${f.department || ''}</td>
      <td>${month}</td>
      <td>${f.total_amount}</td>
      <td class="status-${status.toLowerCase()}">${status}</td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilters(){
  const nameFilter = document.getElementById('filterName').value.toLowerCase();
  const dept = document.getElementById('filterDepartment').value;
  const month = document.getElementById('filterMonth').value;
  const status = document.getElementById('filterStatus').value;

  const filtered = feeData.filter(f=>{
    const name = (studentsMap[f.student_id]||'').toLowerCase();
    const m = monthName(f.due_date);
    const st = f.status || ( (Number(f.amount_paid||0) >= Number(f.total_amount||0)) ? 'Paid' : 'Missing');
    return (!nameFilter || name.includes(nameFilter)) &&
           (!dept || (f.department||'') === dept) &&
           (!month || m === month) &&
           (!status || st === status);
  });
  renderFees(filtered);
}

async function init(){
  try{
    const [fees, students] = await Promise.all([
      fetch('/fees').then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch('/students').then(r=>r.ok?r.json():[]).catch(()=>[])
    ]);
    feeData = fees || [];
    studentsMap = Object.fromEntries((students||[]).map(s=>[s.student_id, s.full_name]));
    renderFees(feeData);
  }catch(e){ console.error('Failed to load fees', e); }
}

window.applyFilters = applyFilters;
window.addEventListener('load', init);
