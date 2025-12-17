/* =======================================================
   EDU Track - Dashboard Data Loader
   Loads real data from backend for dashboards
   ======================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Load dashboard data based on user role
  try {
    if (user.role === 'student') {
      await loadStudentDashboard(user);
    } else if (user.role === 'faculty') {
      await loadFacultyDashboard(user);
    } else if (user.role === 'admin') {
      await loadAdminDashboard(user);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    if (window.showToast) {
      showToast('Failed to load dashboard data', 'error');
    }
  }
});

async function loadStudentDashboard(user) {
  try {
    // Load student data in parallel
    const [
      studentData,
      enrollments,
      grades,
      fees,
      notifications,
      attendance
    ] = await Promise.all([
      API.students.getById(user.id),
      API.enrollments.getByStudent(user.id),
      API.grades.getByStudent(user.id),
      API.fees.getByStudent(user.id),
      API.notifications.getByStudent(user.id),
      API.attendance.getByStudent(user.id)
    ]);

    // Update enrollment count
    const enrollmentCount = document.querySelector('#enrollmentCount');
    if (enrollmentCount) {
      enrollmentCount.textContent = enrollments.length;
    }

    // Calculate and update attendance percentage
    if (attendance && attendance.length > 0) {
      const present = attendance.filter(a => a.status === 'Present').length;
      const total = attendance.length;
      const percentage = ((present / total) * 100).toFixed(1);
      
      const attendanceElement = document.querySelector('#attendancePercentage');
      if (attendanceElement) {
        attendanceElement.textContent = `${percentage}%`;
      }

      // Update circular progress if exists
      const circleProgress = document.querySelector('.circle-progress');
      if (circleProgress) {
        circleProgress.setAttribute('data-value', Math.round(percentage));
        circleProgress.style.background = `conic-gradient(var(--pastel-mint) ${percentage * 3.6}deg, rgba(11,11,11,0.1) 0)`;
      }
    }

    // Calculate and update GPA
    if (grades && grades.length > 0) {
      const gradePoints = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
      let totalPoints = 0;
      let count = 0;
      
      grades.forEach(g => {
        if (g.grade && gradePoints[g.grade] !== undefined) {
          totalPoints += gradePoints[g.grade];
          count++;
        }
      });

      if (count > 0) {
        const gpa = (totalPoints / count).toFixed(2);
        const gpaElement = document.querySelector('#gpaDisplay') || document.querySelector('#studentGPA');
        if (gpaElement) {
          gpaElement.textContent = gpa;
        }
      }
    }

    // Update fee status
    if (fees && fees.length > 0) {
      const latestFee = fees[fees.length - 1];
      const feeStatusElement = document.querySelector('#feeStatus');
      const feeAmountElement = document.querySelector('#feeAmount');
      
      if (feeStatusElement) {
        feeStatusElement.textContent = latestFee.status || 'Pending';
        feeStatusElement.className = latestFee.status === 'Paid' ? 'status-paid' : 'status-pending';
      }
      
      if (feeAmountElement) {
        const remaining = (latestFee.total_amount || 0) - (latestFee.amount_paid || 0);
        feeAmountElement.textContent = `PKR ${remaining.toLocaleString()}`;
      }
    }

    // Update notification count
    if (notifications && notifications.length > 0) {
      const unreadCount = notifications.filter(n => !n.is_read).length;
      const notifCountElement = document.querySelector('#notificationCount');
      if (notifCountElement) {
        notifCountElement.textContent = unreadCount;
      }
    }

  } catch (error) {
    console.error('Error loading student dashboard:', error);
    throw error;
  }
}

async function loadFacultyDashboard(user) {
  try {
    // Load faculty data in parallel
    const [
      facultyData,
      courses,
      salaries,
      feedback
    ] = await Promise.all([
      API.faculty.getById(user.id),
      API.courses.getAll(),
      API.salaries.getByFaculty(user.id),
      API.feedback.getByFaculty(user.id)
    ]);

    // Filter courses taught by this faculty
    const myCourses = courses.filter(c => c.faculty_id === user.id);
    
    const courseCountElement = document.querySelector('#courseCount');
    if (courseCountElement) {
      courseCountElement.textContent = myCourses.length;
    }

    // Update salary information
    if (salaries && salaries.length > 0) {
      const pendingSalaries = salaries.filter(s => s.status === 'pending');
      const salaryElement = document.querySelector('#pendingSalary');
      if (salaryElement) {
        salaryElement.textContent = pendingSalaries.length;
      }
    }

    // Update feedback count
    if (feedback && feedback.length > 0) {
      const feedbackElement = document.querySelector('#feedbackCount');
      if (feedbackElement) {
        feedbackElement.textContent = feedback.length;
      }
    }

  } catch (error) {
    console.error('Error loading faculty dashboard:', error);
    throw error;
  }
}

async function loadAdminDashboard(user) {
  try {
    // Load admin data in parallel
    const [
      students,
      faculty,
      courses,
      fees,
      enrollments
    ] = await Promise.all([
      API.students.getAll(),
      API.faculty.getAll(),
      API.courses.getAll(),
      API.fees.getAll(),
      API.enrollments.getAll()
    ]);

    // Update student count
    const studentCountElement = document.querySelector('#totalStudents');
    if (studentCountElement) {
      studentCountElement.textContent = students.length;
    }

    // Update faculty count
    const facultyCountElement = document.querySelector('#totalFaculty');
    if (facultyCountElement) {
      facultyCountElement.textContent = faculty.length;
    }

    // Update course count
    const courseCountElement = document.querySelector('#totalCourses');
    if (courseCountElement) {
      courseCountElement.textContent = courses.length;
    }

    // Update pending fees
    if (fees && fees.length > 0) {
      const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'pending');
      const pendingFeesElement = document.querySelector('#pendingFees');
      if (pendingFeesElement) {
        pendingFeesElement.textContent = pendingFees.length;
      }
    }

  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    throw error;
  }
}

// Export functions for use in other scripts
window.loadStudentDashboard = loadStudentDashboard;
window.loadFacultyDashboard = loadFacultyDashboard;
window.loadAdminDashboard = loadAdminDashboard;
