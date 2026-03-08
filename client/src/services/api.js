import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  if (error.code === 'ERR_NETWORK') return 'Unable to connect. Please check if the server is running.';
  return 'Something went wrong. Please try again.';
}

export const predictNews = async (text) => {
  try {
    const response = await api.post('/predict', { text });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const predictNewsFromUrl = async (url) => {
  try {
    const response = await api.post('/predict-url', { url });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getHistory = async () => {
  try {
    const response = await api.get('/history');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data?.history) return data.history;
    if (data?.data) return data.data;
    return [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAnalytics = async () => {
  try {
    const response = await api.get('/analytics');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const clearHistory = async () => {
  try {
    const response = await api.delete('/history');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteArticle = async (articleId) => {
  try {
    const response = await api.delete(`/history/${articleId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export default api;
