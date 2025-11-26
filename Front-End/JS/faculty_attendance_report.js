document.addEventListener('DOMContentLoaded', ()=>{
  const filter = document.getElementById('courseFilter');
  filter.addEventListener('change', filterAttendance);
});

function filterAttendance(){
  const course = document.getElementById('courseFilter').value.toLowerCase();
  const table = document.getElementById('attendanceTable');
  for(let i=1;i<table.rows.length;i++){
    const row = table.rows[i];
    const rowCourse = row.cells[2].innerText.toLowerCase();
    row.style.display = (!course || rowCourse === course) ? '' : 'none';
  }
}
