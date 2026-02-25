import api from './index';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const submissionApi = {
  upload: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/submissions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMine: (params) => api.get('/submissions/mine', { params }),
  getById: (id) => api.get(`/submissions/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getSubmissions: (params) => api.get('/admin/submissions', { params }),
  getFaculty: () => api.get('/admin/faculty'),
  assignFaculty: (data) => api.post('/admin/assign', data),
};

export const facultyApi = {
  getStats: () => api.get('/faculty/stats'),
  getAssigned: (params) => api.get('/faculty/assigned', { params }),
  getReviews: (params) => api.get('/faculty/reviews', { params }),
  submitReview: (data) => api.post('/faculty/review', data),
};