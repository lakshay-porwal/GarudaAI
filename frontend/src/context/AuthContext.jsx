import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('garuda_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Configure global interceptor to handle session expiration (401 Unauthorized)
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear user from state and localStorage
          setUser(null);
          localStorage.removeItem('garuda_user');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (emailID, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { emailID, password });
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('garuda_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, emailID, password) => {
    setLoading(true);
    try {
      // 1. Create user account
      await api.post('/signup', { name, emailID, password });
      
      // 2. Perform auto-login to set JWT HTTP-only cookies
      const loginResponse = await api.post('/login', { emailID, password });
      const userData = loginResponse.data.user;
      setUser(userData);
      localStorage.setItem('garuda_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('garuda_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
