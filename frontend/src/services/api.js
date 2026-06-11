import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://garudaai-7qnc.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
