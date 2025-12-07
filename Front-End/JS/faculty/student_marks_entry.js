/* ============================================================
   EDU Track - Student Marks Entry
   Individual student assessment marks management
   Weightage System:
   - Quizzes (3): 3.333% each = 10% total
   - Assignments (3): 3.333% each = 10% total  
   - Midterm 1: 15%
   - Midterm 2: 15%
   - Final: 50%
   ============================================================ */

async function fetchJson(path, opts = {}) {
  try {
    const base = window.API_BASE || '';
    const candidates = path.startsWith('http') ? [path] : [path, path.endsWith('/') ? path : path + '/'];
    for (const p of candidates) {
      const url = p.startsWith('http') ? p : (base ? base + p : p);
      try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        console.debug('[fetchJson] candidate failed', url, e.message);
      }
    }
  } catch (e) {
    try {
      const base2 = 'http://127.0.0.1:8000';
      const candidates2 = [path, path.endsWith('/') ? path : path + '/'];
      for (const p of candidates2) {
        const fallback = base2 + p;
        try {
          const res2 = await fetch(fallback, opts);
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          return await res2.json();
        } catch (e2) {
          console.debug('[fetchJson] fallback failed', fallback, e2.message);
        }
      }
    } catch (e2) {
      console.error('[marks_entry] fetchJson failed', path, e, e2);
      if (window.showToast) window.showToast(`Failed to load: ${path}`, 'error');
      return null;
    }
  }
  return null;
}

let currentMarks = null;
let marksId = null;

async function loadStudentMarks() {
  // Get data from sessionStorage
  const entryData = JSON.parse(sessionStorage.getItem('marksEntry') || '{}');
  
  if (!entryData.student_id || !entryData.course_id) {
    if (window.showToast) window.showToast('Invalid access. Please select a student from the list.', 'error');
    setTimeout(() => window.location.href = '/pages/dashboard/faculty/faculty_grades_new.html', 2000);
    return;
  }

  // Update header
  document.getElementById('studentNameHeader').textContent = entryData.student_name;
  document.getElementById('courseNameHeader').textContent = `${entryData.course_code} - ${entryData.course_name}`;
  document.getElementById('studentName').textContent = entryData.student_name;
  document.getElementById('courseName').textContent = `${entryData.course_code} - ${entryData.course_name}`;

  // Fetch existing marks
  const allMarks = await fetchJson('/marks');
  currentMarks = allMarks?.find(m => 
    m.student_id === entryData.student_id && m.course_id === entryData.course_id
  );

  // Populate fields
  if (currentMarks) {
    marksId = currentMarks.mark_id;
    document.getElementById('quiz1').value = currentMarks.quiz1 || 0;
    document.getElementById('quiz2').value = currentMarks.quiz2 || 0;
    document.getElementById('quiz3').value = currentMarks.quiz3 || 0;
    document.getElementById('assignment1').value = currentMarks.assignment1 || 0;
    document.getElementById('assignment2').value = currentMarks.assignment2 || 0;
    document.getElementById('assignment3').value = currentMarks.assignment3 || 0;
    document.getElementById('midterm1').value = currentMarks.midterm1 || 0;
    document.getElementById('midterm2').value = currentMarks.midterm2 || 0;
    document.getElementById('final_exam').value = currentMarks.final_exam || 0;
  }

  calculateTotal();
}

function calculateTotal() {
  // Get all values
  const quiz1 = parseFloat(document.getElementById('quiz1').value) || 0;
  const quiz2 = parseFloat(document.getElementById('quiz2').value) || 0;
  const quiz3 = parseFloat(document.getElementById('quiz3').value) || 0;
  const assignment1 = parseFloat(document.getElementById('assignment1').value) || 0;
  const assignment2 = parseFloat(document.getElementById('assignment2').value) || 0;
  const assignment3 = parseFloat(document.getElementById('assignment3').value) || 0;
  const midterm1 = parseFloat(document.getElementById('midterm1').value) || 0;
  const midterm2 = parseFloat(document.getElementById('midterm2').value) || 0;
  const finalExam = parseFloat(document.getElementById('final_exam').value) || 0;

  // Calculate individual weightages
  const quiz1Weight = (quiz1 / 100) * 3.333;
  const quiz2Weight = (quiz2 / 100) * 3.333;
  const quiz3Weight = (quiz3 / 100) * 3.333;
  const assignment1Weight = (assignment1 / 100) * 3.333;
  const assignment2Weight = (assignment2 / 100) * 3.333;
  const assignment3Weight = (assignment3 / 100) * 3.333;
  const midterm1Weight = (midterm1 / 100) * 15;
  const midterm2Weight = (midterm2 / 100) * 15;
  const finalWeight = (finalExam / 100) * 50;

  // Update individual weightages
  document.getElementById('quiz1-weightage').textContent = quiz1Weight.toFixed(2) + '%';
  document.getElementById('quiz2-weightage').textContent = quiz2Weight.toFixed(2) + '%';
  document.getElementById('quiz3-weightage').textContent = quiz3Weight.toFixed(2) + '%';
  document.getElementById('assignment1-weightage').textContent = assignment1Weight.toFixed(2) + '%';
  document.getElementById('assignment2-weightage').textContent = assignment2Weight.toFixed(2) + '%';
  document.getElementById('assignment3-weightage').textContent = assignment3Weight.toFixed(2) + '%';
  document.getElementById('midterm1-weightage').textContent = midterm1Weight.toFixed(2) + '%';
  document.getElementById('midterm2-weightage').textContent = midterm2Weight.toFixed(2) + '%';
  document.getElementById('final-weightage').textContent = finalWeight.toFixed(2) + '%';

  // Calculate section totals
  const quizTotal = quiz1Weight + quiz2Weight + quiz3Weight;
  const assignmentTotal = assignment1Weight + assignment2Weight + assignment3Weight;
  const midtermTotal = midterm1Weight + midterm2Weight;
  const finalTotal = finalWeight;

  document.getElementById('quizTotal').textContent = quizTotal.toFixed(2) + '%';
  document.getElementById('assignmentTotal').textContent = assignmentTotal.toFixed(2) + '%';
  document.getElementById('midtermTotal').textContent = midtermTotal.toFixed(2) + '%';
  document.getElementById('finalTotal').textContent = finalTotal.toFixed(2) + '%';

  // Calculate grand total
  const grandTotal = quizTotal + assignmentTotal + midtermTotal + finalTotal;
  document.getElementById('totalMarks').textContent = grandTotal.toFixed(2);

  // Determine grade
  let grade = 'F';
  if (grandTotal >= 85) grade = 'A+';
  else if (grandTotal >= 80) grade = 'A';
  else if (grandTotal >= 75) grade = 'A-';
  else if (grandTotal >= 70) grade = 'B+';
  else if (grandTotal >= 65) grade = 'B';
  else if (grandTotal >= 60) grade = 'B-';
  else if (grandTotal >= 55) grade = 'C+';
  else if (grandTotal >= 50) grade = 'C';
  else if (grandTotal >= 45) grade = 'D';

  const gradeElement = document.getElementById('letterGrade');
  gradeElement.textContent = grade;
  gradeElement.className = 'grade-badge grade-' + grade.toLowerCase().replace('+', 'plus').replace('-', 'minus');
}

async function saveMarks() {
  const entryData = JSON.parse(sessionStorage.getItem('marksEntry') || '{}');
  
  if (!entryData.student_id || !entryData.course_id) {
    if (window.showToast) window.showToast('Invalid data', 'error');
    return;
  }

  // Get all values
  const quiz1 = parseFloat(document.getElementById('quiz1').value) || 0;
  const quiz2 = parseFloat(document.getElementById('quiz2').value) || 0;
  const quiz3 = parseFloat(document.getElementById('quiz3').value) || 0;
  const assignment1 = parseFloat(document.getElementById('assignment1').value) || 0;
  const assignment2 = parseFloat(document.getElementById('assignment2').value) || 0;
  const assignment3 = parseFloat(document.getElementById('assignment3').value) || 0;
  const midterm1 = parseFloat(document.getElementById('midterm1').value) || 0;
  const midterm2 = parseFloat(document.getElementById('midterm2').value) || 0;
  const finalExam = parseFloat(document.getElementById('final_exam').value) || 0;

  // Calculate total
  const quizTotal = (quiz1 / 100 * 3.333) + (quiz2 / 100 * 3.333) + (quiz3 / 100 * 3.333);
  const assignmentTotal = (assignment1 / 100 * 3.333) + (assignment2 / 100 * 3.333) + (assignment3 / 100 * 3.333);
  const midtermTotal = (midterm1 / 100 * 15) + (midterm2 / 100 * 15);
  const finalTotal = (finalExam / 100 * 50);
  const grandTotal = quizTotal + assignmentTotal + midtermTotal + finalTotal;

  // Determine grade
  let grade = 'F';
  if (grandTotal >= 85) grade = 'A+';
  else if (grandTotal >= 80) grade = 'A';
  else if (grandTotal >= 75) grade = 'A-';
  else if (grandTotal >= 70) grade = 'B+';
  else if (grandTotal >= 65) grade = 'B';
  else if (grandTotal >= 60) grade = 'B-';
  else if (grandTotal >= 55) grade = 'C+';
  else if (grandTotal >= 50) grade = 'C';
  else if (grandTotal >= 45) grade = 'D';

  try {
    // Save/Update Marks
    const marksData = {
      student_id: entryData.student_id,
      course_id: entryData.course_id,
      semester: 1, // Default semester, could be fetched from course data
      quiz1, quiz2, quiz3,
      quiz_total: quizTotal,
      assignment1, assignment2, assignment3,
      assignment_total: assignmentTotal,
      midterm1, midterm2,
      final_exam: finalExam,
      total_marks: grandTotal,
      grade_letter: grade
    };

    let marksResult;
    if (marksId) {
      marksResult = await fetchJson(`/marks/${marksId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marksData)
      });
    } else {
      marksResult = await fetchJson('/marks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marksData)
      });
      if (marksResult) marksId = marksResult.mark_id;
    }

    // Save/Update Grade
    const gradeData = {
      student_id: entryData.student_id,
      course_id: entryData.course_id,
      marks_obtained: grandTotal,
      grade: grade,
      semester: 1 // You may want to get this from course data
    };

    // Check if grade exists
    const existingGrades = await fetchJson('/grades/');
    const existingGrade = existingGrades?.find(g => 
      g.student_id === entryData.student_id && g.course_id === entryData.course_id
    );

    if (existingGrade) {
      await fetchJson(`/grades/${existingGrade.grade_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
    } else {
      await fetchJson('/grades/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
    }

    if (window.showToast) window.showToast('Marks saved successfully!', 'success');
    
    // Redirect back after 1.5 seconds
    setTimeout(() => {
      window.location.href = '/pages/dashboard/faculty/faculty_grades_new.html';
    }, 1500);

  } catch (error) {
    console.error('Error saving marks:', error);
    if (window.showToast) window.showToast('Error saving marks', 'error');
  }
}

function goBack() {
  window.location.href = '/pages/dashboard/faculty/faculty_grades_new.html';
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    protectDashboard && protectDashboard('faculty');
  } catch (e) { }
  
  loadStudentMarks();
});
