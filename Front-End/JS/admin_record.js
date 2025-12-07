// ==========================================
// EDU Track — Admin Records Page JavaScript  
// ==========================================

console.log('=== admin_record.js loaded ===');

// Global state
let allEnrollments = [];
let allStudents = [];
let allCourses = [];
let filteredEnrollments = [];
let currentPage = 1;
let rowsPerPage = 25;
let selectedRecords = new Set();
let sortColumn = null;
let sortDirection = 'asc';

// API Base URL
const API_BASE = window.API_BASE || 'http://127.0.0.1:8000';

// ==========================================
// Utility Functions
// ==========================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showLoading(show = true) {
    const tbody = document.querySelector('#reportTable tbody');
    if (!tbody) return;
    
    if (show) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="8" style="text-align:center;padding:40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p>Loading records...</p>
                </td>
            </tr>
        `;
    }
}

function showError(message) {
    const tbody = document.querySelector('#reportTable tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:#dc3545;">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <p>${message}</p>
                </td>
            </tr>
        `;
    }
    showToast(message, 'error');
}

async function fetchJson(endpoint, options = {}) {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('[fetchJson] Error:', error);
        throw error;
    }
}

// ==========================================
// Data Loading
// ==========================================

async function loadAllData() {
    showLoading(true);
    
    try {
        const [enrollmentsData, studentsData, coursesData] = await Promise.all([
            fetchJson('/enrollments/'),
            fetchJson('/students/'),
            fetchJson('/courses/')
        ]);
        
        allEnrollments = enrollmentsData || [];
        allStudents = studentsData || [];
        allCourses = coursesData || [];
        
        if (allEnrollments.length === 0) {
            showError('No enrollment records found');
            return;
        }
        
        populateFilters();
        applyFilters();
        showToast(`Loaded ${allEnrollments.length} records`, 'success');
        
    } catch (error) {
        showError('Failed to load data: ' + error.message);
    }
}

function populateFilters() {
    // Populate student filter
    const studentFilter = document.getElementById('filterStudent');
    if (studentFilter) {
        const existingOptions = Array.from(studentFilter.querySelectorAll('option')).slice(1);
        existingOptions.forEach(opt => opt.remove());
        
        allStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.student_id;
            option.textContent = `${student.full_name} (ID: ${student.student_id})`;
            studentFilter.appendChild(option);
        });
    }
    
    // Populate course filter
    const courseFilter = document.getElementById('filterCourse');
    if (courseFilter) {
        const existingOptions = Array.from(courseFilter.querySelectorAll('option')).slice(1);
        existingOptions.forEach(opt => opt.remove());
        
        allCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = `${course.course_name} (${course.course_code})`;
            courseFilter.appendChild(option);
        });
    }
    
    // Populate modal dropdowns
    const modalStudentSelect = document.getElementById('studentId');
    if (modalStudentSelect) {
        const existingOptions = Array.from(modalStudentSelect.querySelectorAll('option')).slice(1);
        existingOptions.forEach(opt => opt.remove());
        
        allStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.student_id;
            option.textContent = student.full_name;
            modalStudentSelect.appendChild(option);
        });
    }
    
    const modalCourseSelect = document.getElementById('courseId');
    if (modalCourseSelect) {
        const existingOptions = Array.from(modalCourseSelect.querySelectorAll('option')).slice(1);
        existingOptions.forEach(opt => opt.remove());
        
        allCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_id;
            option.textContent = course.course_name;
            modalCourseSelect.appendChild(option);
        });
    }
}

// ==========================================
// Filtering
// ==========================================

function applyFilters() {
    const studentId = document.getElementById('filterStudent')?.value || '';
    const courseId = document.getElementById('filterCourse')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const semester = document.getElementById('filterSemester')?.value || '';
    const searchQuery = document.getElementById('tableSearch')?.value.toLowerCase() || '';
    
    filteredEnrollments = allEnrollments.filter(enrollment => {
        if (studentId && enrollment.student_id !== Number(studentId)) return false;
        if (courseId && enrollment.course_id !== Number(courseId)) return false;
        if (status && (enrollment.status || 'Active').toLowerCase() !== status.toLowerCase()) return false;
        if (semester && enrollment.semester !== semester) return false;
        
        if (searchQuery) {
            const student = allStudents.find(s => s.student_id === enrollment.student_id);
            const course = allCourses.find(c => c.course_id === enrollment.course_id);
            const searchText = `${student?.full_name || ''} ${course?.course_name || ''} ${enrollment.semester || ''}`.toLowerCase();
            if (!searchText.includes(searchQuery)) return false;
        }
        
        return true;
    });
    
    updateStatistics();
    currentPage = 1;
    renderTable();
}

function updateStatistics() {
    const total = filteredEnrollments.length;
    const activeStudentIds = new Set(
        filteredEnrollments
            .filter(e => (e.status || 'Active').toLowerCase() === 'active')
            .map(e => e.student_id)
    );
    const completed = filteredEnrollments.filter(e => (e.status || '').toLowerCase() === 'completed').length;
    const dropped = filteredEnrollments.filter(e => {
        const s = (e.status || '').toLowerCase();
        return s === 'dropped' || s === 'withdrawn';
    }).length;
    
    document.getElementById('totalEnrollments').textContent = total;
    document.getElementById('activeStudents').textContent = activeStudentIds.size;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('dropoutCount').textContent = dropped;
    document.getElementById('recordCount').textContent = `${total} record${total !== 1 ? 's' : ''}`;
}

// ==========================================
// Table Rendering
// ==========================================

function renderTable() {
    const tbody = document.querySelector('#reportTable tbody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = filteredEnrollments.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:#999;">
                    <i class="fas fa-inbox fa-2x"></i>
                    <p>No records found</p>
                </td>
            </tr>
        `;
        renderPagination();
        return;
    }
    
    pageData.forEach(enrollment => {
        const student = allStudents.find(s => s.student_id === enrollment.student_id);
        const course = allCourses.find(c => c.course_id === enrollment.course_id);
        
        const studentName = student?.full_name || `Student #${enrollment.student_id}`;
        const courseName = course?.course_name || `Course #${enrollment.course_id}`;
        const status = enrollment.status || 'Active';
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        
        const tr = document.createElement('tr');
        tr.dataset.enrollmentId = enrollment.enrollment_id;
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox" value="${enrollment.enrollment_id}">
            </td>
            <td>${enrollment.enrollment_id}</td>
            <td>${studentName}</td>
            <td>${courseName}</td>
            <td>${enrollment.semester || '—'}</td>
            <td><span class="status-badge status-${statusClass}">${status}</span></td>
            <td>${enrollment.grade || '—'}</td>
            <td>
                <button class="btn-icon btn-view" onclick="viewRecord(${enrollment.enrollment_id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-edit" onclick="editRecord(${enrollment.enrollment_id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteRecord(${enrollment.enrollment_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    renderPagination();
}

function renderPagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredEnrollments.length / rowsPerPage);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    pagination.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredEnrollments.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
}

// ==========================================
// CRUD Operations
// ==========================================

function openAddModal() {
    const modal = document.getElementById('recordModal');
    const form = document.getElementById('recordForm');
    
    if (form) form.reset();
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Enrollment';
    document.getElementById('enrollmentId').value = '';
    
    if (modal) modal.classList.add('show');
}

function viewRecord(enrollmentId) {
    const enrollment = allEnrollments.find(e => e.enrollment_id === enrollmentId);
    if (!enrollment) return;
    
    const student = allStudents.find(s => s.student_id === enrollment.student_id);
    const course = allCourses.find(c => c.course_id === enrollment.course_id);
    
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <p><strong>ID:</strong> ${enrollment.enrollment_id}</p>
            <p><strong>Student:</strong> ${student?.full_name || 'Unknown'}</p>
            <p><strong>Course:</strong> ${course?.course_name || 'Unknown'}</p>
            <p><strong>Semester:</strong> ${enrollment.semester || 'N/A'}</p>
            <p><strong>Status:</strong> ${enrollment.status || 'Active'}</p>
            <p><strong>Grade:</strong> ${enrollment.grade || 'Not graded'}</p>
        </div>
    `;
    
    document.getElementById('detailsModal').classList.add('show');
}

function editRecord(enrollmentId) {
    const enrollment = allEnrollments.find(e => e.enrollment_id === enrollmentId);
    if (!enrollment) return;
    
    document.getElementById('enrollmentId').value = enrollment.enrollment_id;
    document.getElementById('studentId').value = enrollment.student_id;
    document.getElementById('courseId').value = enrollment.course_id;
    document.getElementById('semester').value = enrollment.semester || '';
    document.getElementById('enrollmentStatus').value = enrollment.status || 'Active';
    document.getElementById('grade').value = enrollment.grade || '';
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Enrollment';
    document.getElementById('recordModal').classList.add('show');
}

async function deleteRecord(enrollmentId) {
    if (!confirm('Delete this enrollment?')) return;
    
    try {
        await fetchJson(`/enrollments/${enrollmentId}`, { method: 'DELETE' });
        showToast('Record deleted', 'success');
        loadAllData();
    } catch (error) {
        showToast('Delete failed: ' + error.message, 'error');
    }
}

async function saveRecord(e) {
    e.preventDefault();
    
    const enrollmentId = document.getElementById('enrollmentId').value;
    const data = {
        student_id: Number(document.getElementById('studentId').value),
        course_id: Number(document.getElementById('courseId').value),
        semester: document.getElementById('semester').value,
        status: document.getElementById('enrollmentStatus').value,
        grade: document.getElementById('grade').value || null
    };
    
    try {
        if (enrollmentId) {
            await fetchJson(`/enrollments/${enrollmentId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            showToast('Record updated', 'success');
        } else {
            await fetchJson('/enrollments/', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            showToast('Record created', 'success');
        }
        
        document.getElementById('recordModal').classList.remove('show');
        loadAllData();
    } catch (error) {
        showToast('Save failed: ' + error.message, 'error');
    }
}

async function bulkDeleteRecords() {
    const selected = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => Number(cb.value));
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} record(s)?`)) return;
    
    try {
        await Promise.all(selected.map(id => fetchJson(`/enrollments/${id}`, { method: 'DELETE' })));
        showToast('Records deleted', 'success');
        loadAllData();
    } catch (error) {
        showToast('Delete failed: ' + error.message, 'error');
    }
}

// ==========================================
// Export
// ==========================================

function exportToCSV() {
    if (filteredEnrollments.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    
    const headers = ['ID', 'Student ID', 'Student Name', 'Course ID', 'Course Name', 'Semester', 'Status', 'Grade'];
    const rows = filteredEnrollments.map(e => {
        const student = allStudents.find(s => s.student_id === e.student_id);
        const course = allCourses.find(c => c.course_id === e.course_id);
        return [e.enrollment_id, e.student_id, student?.full_name || '', e.course_id, course?.course_name || '', e.semester || '', e.status || 'Active', e.grade || ''];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enrollment_records.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('CSV exported', 'success');
}

function exportToPDF() {
    showToast('PDF export coming soon', 'info');
}

// ==========================================
// Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Initializing Admin Records ===');
    
    loadAllData();
    
    document.getElementById('addNewRecord')?.addEventListener('click', openAddModal);
    document.getElementById('refreshData')?.addEventListener('click', loadAllData);
    document.getElementById('exportCsv')?.addEventListener('click', exportToCSV);
    document.getElementById('exportPdf')?.addEventListener('click', exportToPDF);
    
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('clearFilters')?.addEventListener('click', () => {
        document.getElementById('reportFilters').reset();
        applyFilters();
    });
    
    document.getElementById('tableSearch')?.addEventListener('input', applyFilters);
    document.getElementById('rowsPerPage')?.addEventListener('change', (e) => {
        rowsPerPage = Number(e.target.value);
        currentPage = 1;
        renderTable();
    });
    
    document.getElementById('bulkDelete')?.addEventListener('click', bulkDeleteRecords);
    
    document.getElementById('recordForm')?.addEventListener('submit', saveRecord);
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.remove('show');
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    });
});

// Global functions
window.viewRecord = viewRecord;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.changePage = changePage;
window.logout = function() {
    if (confirm('Logout?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    }
};
