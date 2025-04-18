import API from "./api";

// Base endpoint for screenings
const BASE_URL = '/screenings';

/**
 * Get all screenings
 * @param {Object} params - Optional query parameters
 * @returns {Promise} - Promise with response
 */
export const getAllScreenings = (params = {}) => {
  return API.get(BASE_URL, { params });
};

/**
 * Get a single screening by ID
 * @param {string} screeningId - Screening ID
 * @returns {Promise} - Promise with response
 */
export const getScreeningById = (screeningId) => {
  return API.get(`${BASE_URL}/${screeningId}`);
};

/**
 * Create a new screening
 * @param {Object} screeningData - Screening data to create
 * @returns {Promise} - Promise with response
 */
export const createScreening = (screeningData) => {
  return API.post(BASE_URL, screeningData);
};

/**
 * Update an existing screening
 * @param {string} screeningId - Screening ID
 * @param {Object} screeningData - Updated screening data
 * @returns {Promise} - Promise with response
 */
export const updateScreening = (screeningId, screeningData) => {
  return API.put(`${BASE_URL}/${screeningId}`, screeningData);
};

/**
 * Delete a screening
 * @param {string} screeningId - Screening ID
 * @returns {Promise} - Promise with response
 */
export const deleteScreening = (screeningId) => {
  return API.delete(`${BASE_URL}/${screeningId}`);
};

/**
 * Get screenings by status
 * @param {string} status - Status to filter by (upcoming, completed, expired)
 * @returns {Promise} - Promise with response
 */
export const getScreeningsByStatus = (status) => {
  return API.get(`${BASE_URL}`, { params: { status } });
};

/**
 * Reopen an expired screening
 * @param {string} screeningId - Screening ID
 * @returns {Promise} - Promise with response
 */
export const reopenScreening = (screeningId) => {
  return API.post(`${BASE_URL}/${screeningId}/reopen`);
};

/**
 * Get screening report
 * @param {string} screeningId - Screening ID
 * @returns {Promise} - Promise with response
 */
export const getScreeningReport = (screeningId) => {
  return API.get(`${BASE_URL}/${screeningId}/report`);
};