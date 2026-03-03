import api from './index';

export const submissionApi = {
  getMySubmissions: () => {
    return api.get('/submissions/my');
  },

  upload: (formData) => {
    return api.post('/submissions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getSubmission: (id) => {
    return api.get(`/submissions/${id}`);
  }
};
