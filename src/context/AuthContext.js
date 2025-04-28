// src/context/AuthContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * @param {Object} userData - User data from API
   * @param {string} token - Authentication token
   * @param {boolean} rememberMe - Whether to store in localStorage or sessionStorage
   */
  const login = (userData, token, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Store auth data
    storage.setItem('authToken', token);
    storage.setItem('user', JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    
    // Redirect to dashboard
    navigate('/screenings/all-screenings');
  };

  /**
   * Logout function
   */
  const logout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    // Update state
    setUser(null);
    
    // Redirect to login
    navigate('/authentication/sign-in/cover');
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  const isAuthenticated = () => {
    return !!user;
  };

  // Context value
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use the auth context
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;