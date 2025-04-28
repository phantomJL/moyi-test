import API from "./api";

// Base endpoint for screenings
const BASE_URL = '/screenings';

export const getAllScreenings = (params = {}) => {
  return API.get(BASE_URL, { params });
};

export const getScreeningById = (screeningId) => {
  return API.get(`${BASE_URL}/${screeningId}`);
};

export const createScreening = (screeningData) => {
  return API.post(BASE_URL, screeningData);
};

export const updateScreening = (screeningId, screeningData) => {
  return API.put(`${BASE_URL}/${screeningId}`, screeningData);
};

export const updateScreeningQuestions = (screeningId, questions)=>{
  return API.put(`${BASE_URL}/${screeningId}/questions`, questions);
}

export const deleteScreening = (screeningId) => {
  return API.delete(`${BASE_URL}/${screeningId}`);
};

export const getScreeningsByStatus = (status) => {
  return API.get(`${BASE_URL}`, { params: { status } });
};

export const reopenScreening = (screeningId) => {
  return API.post(`${BASE_URL}/${screeningId}/reopen`);
};

export const getScreeningReport = (screeningId) => {
  return API.get(`${BASE_URL}/${screeningId}/report`);
};