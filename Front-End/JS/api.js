/* =======================================================
   EDU Track - API Configuration
   Central configuration for all API calls
   ======================================================= */

// API Base URL - Change this if your backend is hosted elsewhere
const API_BASE_URL = 'http://127.0.0.1:8000';

// API Helper Functions
const API = {
  baseUrl: API_BASE_URL,
  
  // Generic fetch wrapper with error handling
  async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // GET request
  async get(endpoint) {
    return this.fetch(endpoint, { method: 'GET' });
  },

  // POST request
  async post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PUT request
  async put(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // DELETE request
  async delete(endpoint) {
    return this.fetch(endpoint, { method: 'DELETE' });
  },

  // Auth endpoints
  auth: {
    login: (credentials) => API.post('/auth/login', credentials),
    logout: () => {
      localStorage.removeItem('loggedInUser');
      window.location.href = '/pages/login.html';
    }
  },

  // Student endpoints
  students: {
    getAll: () => API.get('/students'),
    getById: (id) => API.get(`/students/${id}`),
    create: (data) => API.post('/students', data),
    update: (id, data) => API.put(`/students/${id}`, data),
    delete: (id) => API.delete(`/students/${id}`)
  },

  // Faculty endpoints
  faculty: {
    getAll: () => API.get('/faculties'),
    getById: (id) => API.get(`/faculties/${id}`),
    create: (data) => API.post('/faculties', data),
    update: (id, data) => API.put(`/faculties/${id}`, data),
    delete: (id) => API.delete(`/faculties/${id}`)
  },

  // Admin endpoints
  admin: {
    getAll: () => API.get('/admin'),
    getById: (id) => API.get(`/admin/${id}`),
    create: (data) => API.post('/admin', data),
    update: (id, data) => API.put(`/admin/${id}`, data),
    delete: (id) => API.delete(`/admin/${id}`)
  },

  // Course endpoints
  courses: {
    getAll: () => API.get('/courses'),
    getById: (id) => API.get(`/courses/${id}`),
    create: (data) => API.post('/courses', data),
    update: (id, data) => API.put(`/courses/${id}`, data),
    delete: (id) => API.delete(`/courses/${id}`)
  },

  // Enrollment endpoints
  enrollments: {
    getAll: () => API.get('/enrollments'),
    getById: (id) => API.get(`/enrollments/${id}`),
    getByStudent: (studentId) => API.get(`/enrollments/student/${studentId}`),
    create: (data) => API.post('/enrollments', data),
    update: (id, data) => API.put(`/enrollments/${id}`, data),
    delete: (id) => API.delete(`/enrollments/${id}`)
  },

  // Attendance endpoints
  attendance: {
    getAll: () => API.get('/attendance'),
    getByStudent: (studentId) => API.get(`/attendance/student/${studentId}`),
    getByCourse: (courseId) => API.get(`/attendance/course/${courseId}`),
    create: (data) => API.post('/attendance', data),
    update: (id, data) => API.put(`/attendance/${id}`, data)
  },

  // Grades endpoints
  grades: {
    getAll: () => API.get('/grades'),
    getByStudent: (studentId) => API.get(`/grades/student/${studentId}`),
    getByCourse: (courseId) => API.get(`/grades/course/${courseId}`),
    create: (data) => API.post('/grades', data),
    update: (id, data) => API.put(`/grades/${id}`, data)
  },

  // Marks endpoints
  marks: {
    getAll: () => API.get('/marks'),
    getByStudent: (studentId) => API.get(`/marks/student/${studentId}`),
    getByCourse: (courseId) => API.get(`/marks/course/${courseId}`),
    getStudentCourse: (studentId, courseId) => API.get(`/marks/student/${studentId}/course/${courseId}`),
    create: (data) => API.post('/marks', data),
    update: (id, data) => API.put(`/marks/${id}`, data)
  },

  // Fee endpoints
  fees: {
    getAll: () => API.get('/fees'),
    getById: (id) => API.get(`/fees/${id}`),
    getByStudent: (studentId) => API.get(`/fees/student/${studentId}`),
    create: (data) => API.post('/fees', data),
    update: (id, data) => API.put(`/fees/${id}`, data),
    delete: (id) => API.delete(`/fees/${id}`)
  },

  // Notification endpoints
  notifications: {
    getAll: () => API.get('/notifications'),
    getByStudent: (studentId) => API.get(`/notifications/student/${studentId}`),
    markAsRead: (studentId) => API.post(`/notifications/student/${studentId}/mark-read`, {}),
    create: (data) => API.post('/notifications', data),
    delete: (id) => API.delete(`/notifications/${id}`)
  },

  // Feedback endpoints
  feedback: {
    getAll: () => API.get('/feedback'),
    getByFaculty: (facultyId) => API.get(`/feedback/faculty/${facultyId}`),
    create: (data) => API.post('/feedback', data),
    delete: (id) => API.delete(`/feedback/${id}`)
  },

  // Salary endpoints
  salaries: {
    getAll: () => API.get('/salaries'),
    getByFaculty: (facultyId) => API.get(`/salaries/faculty/${facultyId}`),
    create: (data) => API.post('/salaries', data),
    update: (id, data) => API.put(`/salaries/${id}`, data)
  }
};

// Utility function to get current user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('loggedInUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Utility function to check if user is logged in
function isLoggedIn() {
  return !!getCurrentUser();
}

// Utility function to require login (redirect if not logged in)
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

// Expose API globally
window.API = API;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.requireLogin = requireLogin;
