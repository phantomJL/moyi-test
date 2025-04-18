import API from './api';

// Base endpoint for candidates
const BASE_URL = '/candidates';

/**
 * Get all candidates
 * @param {Object} params - Optional query parameters
 * @returns {Promise} - Promise with response
 */
export const getAllCandidates = (params = {}) => {
  return API.get(BASE_URL, { params });
};

/**
 * Get a single candidate by ID
 * @param {string} candidateId - Candidate ID
 * @returns {Promise} - Promise with response
 */
export const getCandidateById = (candidateId) => {
  return API.get(`${BASE_URL}/${candidateId}`);
};

/**
 * Create a new candidate
 * @param {Object} candidateData - Candidate data with the following structure:
 * {
 *   email: string,
 *   name: string,
 *   location: string,
 *   priority: string,
 *   resumeLocation: string (optional)
 * }
 * @returns {Promise} - Promise with response
 */
export const createCandidate = (candidateData) => {
  return API.post(BASE_URL, candidateData);
};

/**
 * Update an existing candidate
 * @param {string} candidateId - Candidate ID
 * @param {Object} candidateData - Updated candidate data
 * @returns {Promise} - Promise with response
 */
export const updateCandidate = (candidateId, candidateData) => {
  return API.put(`${BASE_URL}/${candidateId}`, candidateData);
};

/**
 * Delete a candidate
 * @param {string} candidateId - Candidate ID
 * @returns {Promise} - Promise with response
 */
export const deleteCandidate = (candidateId) => {
  return API.delete(`${BASE_URL}/${candidateId}`);
};

/**
 * Upload resume for a candidate
 * @param {File} file - Resume file to upload
 * @returns {Promise} - Promise with response
 */
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return API.post(`${BASE_URL}/upload-resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Format candidate data for display
 * @param {Object} candidate - Raw candidate data from API
 * @returns {Object} - Formatted candidate data
 */
export const formatCandidateData = (candidate) => {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    location: candidate.location,
    priority: candidate.priority,
    resumeLocation: candidate.resumeLocation,
    resumeUrl: candidate.resumeLocation, // For backward compatibility
    addDate: new Date(candidate.createDate).toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  };
};