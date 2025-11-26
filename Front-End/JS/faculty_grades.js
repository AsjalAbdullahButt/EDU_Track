// Grades management behavior extracted from inline
let assignmentCount = 1;
let quizCount = 1;
const assignmentTotal = 10; // total marks for all assignments
const quizTotal = 15; // total marks for all quizzes

function addAssignment() {
  assignmentCount++;
  const table = document.getElementById("gradesTable");
  const header = table.tHead.rows[0];
  const th = document.createElement("th");
  th.className = "assign-header";
  th.innerHTML = `Assignment${assignmentCount} <button class="add-column-btn" onclick="addAssignment()">+</button>`;
  header.insertBefore(th, header.cells[header.cells.length - 2]);

  const perMark = (assignmentTotal / assignmentCount).toFixed(1);
  for(let i=0;i<table.tBodies[0].rows.length;i++){
    const row = table.tBodies[0].rows[i];
    const td = document.createElement("td");
    td.innerHTML = `<input type="number" value="${perMark}" onchange="calculateTotal(this)">`;
    row.insertBefore(td, row.cells[row.cells.length - 2]);
  }
  calculateAllTotals();
}

function addQuiz() {
  quizCount++;
  const table = document.getElementById("gradesTable");
  const header = table.tHead.rows[0];
  const th = document.createElement("th");
  th.className = "quiz-header";
  th.innerHTML = `Quiz${quizCount} <button class="add-column-btn" onclick="addQuiz()">+</button>`;
  header.insertBefore(th, header.cells[header.cells.length - 2]);

  const perMark = (quizTotal / quizCount).toFixed(1);
  for(let i=0;i<table.tBodies[0].rows.length;i++){
    const row = table.tBodies[0].rows[i];
    const td = document.createElement("td");
    td.innerHTML = `<input type="number" value="${perMark}" onchange="calculateTotal(this)">`;
    row.insertBefore(td, row.cells[row.cells.length - 2]);
  }
  calculateAllTotals();
}

function calculateTotal(el){
  const row = el.closest('tr');
  let total = 0;
  for(let i=2;i<row.cells.length-1;i++){
    const input = row.cells[i].querySelector('input');
    const val = parseFloat(input?.value || 0);
    total += val;
  }
  row.querySelector('.total').textContent = total.toFixed(1);
}

function calculateAllTotals(){
  const table = document.getElementById("gradesTable");
  for(let i=0;i<table.tBodies[0].rows.length;i++){
    const row = table.tBodies[0].rows[i];
    // find a representative input to pass
    const input = row.querySelector('input') || row.cells[2];
    if(input && input.tagName === 'INPUT') calculateTotal(input);
  }
}

window.addAssignment = addAssignment;
window.addQuiz = addQuiz;
window.calculateTotal = calculateTotal;
window.calculateAllTotals = calculateAllTotals;

document.addEventListener('DOMContentLoaded', ()=>{
  calculateAllTotals();
  // tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t=> t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
  }));
});
