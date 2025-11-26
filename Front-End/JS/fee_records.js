// Extracted from fee_records.html
const sampleStudents = [
  { id: 1, name: "Alice", department: "Computer Science", month: "January", amount: 1000, status: "Paid" },
  { id: 2, name: "Bob", department: "Mathematics", month: "January", amount: 1000, status: "Missing" },
  { id: 3, name: "Charlie", department: "Physics", month: "February", amount: 1000, status: "Paid" },
  { id: 4, name: "David", department: "Computer Science", month: "March", amount: 1000, status: "Missing" },
  { id: 5, name: "Eva", department: "Mathematics", month: "February", amount: 1000, status: "Paid" },
  { id: 6, name: "Frank", department: "Physics", month: "March", amount: 1000, status: "Missing" }
];

function populateFeeTable(data) {
  const tbody = document.getElementById('feeList');
  tbody.innerHTML = '';
  data.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.department}</td>
      <td>${student.month}</td>
      <td>${student.amount}</td>
      <td class="status-${student.status.toLowerCase()}">${student.status}</td>
    `;
    tbody.appendChild(row);
  });
}

function applyFilters() {
  const nameFilter = document.getElementById('filterName').value.toLowerCase();
  const departmentFilter = document.getElementById('filterDepartment').value;
  const monthFilter = document.getElementById('filterMonth').value;
  const statusFilter = document.getElementById('filterStatus').value;

  const filtered = sampleStudents.filter(s => {
    return (!nameFilter || s.name.toLowerCase().includes(nameFilter)) &&
           (!departmentFilter || s.department === departmentFilter) &&
           (!monthFilter || s.month === monthFilter) &&
           (!statusFilter || s.status === statusFilter);
  });

  populateFeeTable(filtered);
}

function logout() {
  alert("Logging out...");
  window.location.href = "/pages/login.html";
}

window.addEventListener('DOMContentLoaded', () => populateFeeTable(sampleStudents));

window.applyFilters = applyFilters;
window.logout = logout;
