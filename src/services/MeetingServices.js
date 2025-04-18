import API from "./api";


// Base endpoint for meetings
const BASE_URL = '/meetings';

/**
 * Create a new meeting for a screening
 * @param {Object} meetingData - Meeting data (screeningId, meetingCreateToken)
 * @returns {Promise} - Promise with response
 */
export const createMeeting = (meetingData) => {
  return API.post(BASE_URL, meetingData);
};

/**
 * Delete a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise} - Promise with response
 */
export const deleteMeeting = (meetingId) => {
  return API.delete(`${BASE_URL}/${meetingId}`);
};

/**
 * Join a meeting
 * @param {string} meetingId - Meeting ID
 * @param {Object} joinData - Join data (attendeeId, joinToken)
 * @returns {Promise} - Promise with response
 */
export const joinMeeting = (meetingId, joinData) => {
  return API.post(`${BASE_URL}/${meetingId}/join`, joinData);
};

/**
 * Get meeting status
 * @param {string} meetingId - Meeting ID
 * @returns {Promise} - Promise with response
 */
export const getMeetingStatus = (meetingId) => {
  return API.get(`${BASE_URL}/${meetingId}/status`);
};

/**
 * Start recording for a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise} - Promise with response
 */
export const startRecording = (meetingId) => {
  return API.post(`${BASE_URL}/${meetingId}/recording/start`);
};

/**
 * Stop recording for a meeting
 * @param {string} meetingId - Meeting ID
 * @returns {Promise} - Promise with response
 */
export const stopRecording = (meetingId) => {
  return API.post(`${BASE_URL}/${meetingId}/recording/stop`);
};

/**
 * Get WebSocket audio URL for a meeting
 * @returns {string} - WebSocket URL
 */
export const getAudioWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const baseUrl = process.env.REACT_APP_API_URL || 'localhost:8080';
  return `${protocol}//${baseUrl}/api/v1/audio`;
};