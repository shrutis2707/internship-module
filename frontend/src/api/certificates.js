import api from './index';

export const certificateApi = {
  getCertificates: () => {
    return api.get('/certificates');
  },

  uploadCertificate: (formData) => {
    return api.post('/certificates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getCertificate: (id) => {
    return api.get(`/certificates/${id}`);
  },

  deleteCertificate: (id) => {
    return api.delete(`/certificates/${id}`);
  }
};
