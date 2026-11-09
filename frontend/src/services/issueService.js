import API from './api'

export const issueService = {
  // Get all issues with filters
  getIssues: (params) => API.get('/issues', { params }),

  // Get issues for map
  getIssuesForMap: (params) => API.get('/issues/map', { params }),

  // Get single issue
  getIssue: (id) => API.get(`/issues/${id}`),

  // Create issue (FormData with optional image)
  createIssue: (formData) =>
    API.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update status (admin)
  updateStatus: (id, status) => API.patch(`/issues/${id}/status`, { status }),

  // Delete issue (admin)
  deleteIssue: (id) => API.delete(`/issues/${id}`),

  // Check for duplicates before submit
  checkDuplicate: (params) => API.get('/issues/check-duplicate', { params }),
}

export const authService = {
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  register: (data) => API.post('/auth/register', data),
}

export const dashboardService = {
  getStats: () => API.get('/dashboard/stats'),
  getCategoryStats: () => API.get('/dashboard/categories'),
  getStatusDistribution: () => API.get('/dashboard/status-distribution'),
  getRecent: () => API.get('/dashboard/recent'),
}

