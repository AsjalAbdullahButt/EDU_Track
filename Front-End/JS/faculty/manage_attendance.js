// manage attendance behavior extracted from inline
const attendanceData = {};
let students = [
  { roll: 'BSCS-001', name: 'Ali Khan' },
  { roll: 'BSCS-002', name: 'Ayesha Noor' },
  { roll: 'BSCS-003', name: 'Ahmed Raza' }
];

function loadAttendance() {
  const date = document.getElementById('attendanceDate').value;
  const course = document.getElementById('courseSelect').value;
  const tbody = document.querySelector('#attendanceTable tbody');
  tbody.innerHTML = '';

  if(!date) return;

  if(!attendanceData[course]) attendanceData[course] = {};
  if(!attendanceData[course][date]) {
    attendanceData[course][date] = students.map(s => ({...s, status:'Absent'}));
  }

  attendanceData[course][date].forEach((s,i)=>{
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td><button class="toggle-btn" onclick="toggleAttendance('${course}','${date}',${i}, this)">${s.status}</button></td>
    `;
    tbody.appendChild(row);
  });
}

function toggleAttendance(course, date, idx, btn) {
  const student = attendanceData[course][date][idx];
  student.status = student.status === 'Present' ? 'Absent' : 'Present';
  btn.textContent = student.status;
  btn.style.background = student.status === 'Present' ? '#27ae60' : '#001f3f';
}

function markAllAbsent() {
  const date = document.getElementById('attendanceDate').value;
  const course = document.getElementById('courseSelect').value;
  if(!date) return showAlert('Select a date first','warning');
  attendanceData[course][date].forEach(s=>s.status='Absent');
  loadAttendance();
}

window.loadAttendance = loadAttendance;
window.toggleAttendance = toggleAttendance;
window.markAllAbsent = markAllAbsent;

document.addEventListener('DOMContentLoaded', ()=>{
  // attach event listeners if relevant
  const dateInput = document.getElementById('attendanceDate');
  const courseSelect = document.getElementById('courseSelect');
  if(dateInput) dateInput.addEventListener('change', loadAttendance);
  if(courseSelect) courseSelect.addEventListener('change', loadAttendance);
});
