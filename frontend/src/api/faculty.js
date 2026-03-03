import api from './index';

export const facultyApi = {
  getAssignedSubmissions: () => {
    return api.get('/faculty/assigned');
  },

  getReviewedSubmissions: () => {
    return api.get('/faculty/reviewed');
  },

  reviewSubmission: (data) => {
    return api.post('/faculty/review', data);
  }
};
