document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('courseFilter').addEventListener('change', filterFeedback);
  document.getElementById('ratingFilter').addEventListener('change', filterFeedback);
});

function filterFeedback(){
  const course = document.getElementById('courseFilter').value.toLowerCase();
  const rating = document.getElementById('ratingFilter').value;
  const table = document.getElementById('feedbackTable');
  for(let i=1;i<table.rows.length;i++){
    const row = table.rows[i];
    const rowCourse = row.cells[0].innerText.toLowerCase();
    const rowRating = row.cells[1].innerText;
    let show = true;
    if(course && rowCourse !== course) show = false;
    if(rating && rowRating !== rating) show = false;
    row.style.display = show ? '' : 'none';
  }
}
