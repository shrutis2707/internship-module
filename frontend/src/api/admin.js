import api from './index';

export const adminApi = {
  getStats: () => {
    return api.get('/admin/stats');
  },

  getUsers: (params) => {
    return api.get('/admin/users', { params });
  },

  getStudents: () => {
    return api.get('/admin/students');
  },

  searchStudent: (query) => {
    return api.get('/admin/student/search', {
      params: { query }
    });
  },

  getSubmissions: (params) => {
    return api.get('/admin/submissions', { params });
  },

  getFaculty: () => {
    return api.get('/admin/faculty');
  },

  assignFaculty: (data) => {
    return api.post('/admin/assign', data);
  }
};
