import API from "./api";


// Base endpoint for meetings
const BASE_URL = '/meetings';

export const createMeeting = (meetingData) => {
  return API.post(BASE_URL, meetingData);
};

export const deleteMeeting = (meetingId) => {
  return API.delete(`${BASE_URL}/${meetingId}`);
};

export const joinMeeting = (meetingId, joinData) => {
  return API.post(`${BASE_URL}/${meetingId}/join`, joinData);
};

export const getMeetingStatus = (meetingId) => {
  return API.get(`${BASE_URL}/${meetingId}/status`);
};

export const startRecording = (meetingId) => {
  return API.post(`${BASE_URL}/${meetingId}/recording/start`);
};

export const stopRecording = (meetingId) => {
  return API.post(`${BASE_URL}/${meetingId}/recording/stop`);
};

export const getAudioWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const baseUrl = process.env.REACT_APP_API_URL || 'localhost:8080';
  return `${protocol}//${baseUrl}/api/v1/audio`;
};