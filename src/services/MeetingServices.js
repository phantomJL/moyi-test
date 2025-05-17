import API from "./api";


// Base endpoint for meetings
const BASE_URL = '/screenings';

export const createMeeting = (screeningId, meetingCreateToken) => {
  return API.post(`${BASE_URL}/${screeningId}/meetings?meetingCreateToken=${meetingCreateToken}`, {});
};

export const deleteMeeting = (screeningId, meetingId) => {
  return API.delete(`${BASE_URL}/${screeningId}/meetings/${meetingId}`);
};

export const getAudioWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const baseUrl = process.env.REACT_APP_API_URL || 'localhost:8080';
  return `${protocol}//${baseUrl}/api/v1/audio`;
};