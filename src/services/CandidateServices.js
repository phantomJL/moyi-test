import API from './api';

// Base endpoint for candidates
const BASE_URL = '/candidates';

export const getAllCandidates = (params = {}) => {
  return API.get(BASE_URL, { params });
};

export const getCandidateById = (candidateId) => {
  return API.get(`${BASE_URL}/${candidateId}`);
};

export const createCandidate = (candidateData) => {
    console.log('Creating candidate with data:', candidateData);
    
    if (!candidateData.resumeLocation) {
      console.warn('Warning: Creating candidate without resumeLocation');
    }
    
    return API.post(BASE_URL, candidateData);
  };

export const updateCandidate = (candidateId, candidateData) => {
  return API.put(`${BASE_URL}/${candidateId}`, candidateData);
};

export const deleteCandidate = (candidateId) => {
  return API.delete(`${BASE_URL}/${candidateId}`);
};

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return API.post(`${BASE_URL}/upload-resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
