import axios from 'axios';

// Add this function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000 < Date.now();
  } catch (e) {
    console.error("Error checking token expiration:", e);
    return true;
  }
};

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update your request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn("Token is expired or invalid");
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/authentication/sign-in/cover';
      } else {
        // Make sure to include the Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log("No token found in storage");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to debug authentication errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.warn("Authentication error - redirecting to login");
        // Optionally: Clear token and redirect to login
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = '/authentication/sign-in/cover';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API Request Error (No response):", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Setup Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default API;