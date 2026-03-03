import api from './index';

export const taskApi = {
  getTasks: (startDate, endDate) => {
    return api.get('/tasks', {
      params: { startDate, endDate }
    });
  },

  saveTask: (data) => {
    return api.post('/tasks', data);
  },

  updateTaskStatus: (taskId, completed) => {
    return api.patch(`/tasks/${taskId}`, { completed });
  },

  deleteTask: (taskId) => {
    return api.delete(`/tasks/${taskId}`);
  },

  getStats: (year, month) => {
    return api.get('/tasks/stats/summary', {
      params: { year, month }
    });
  }
};
