import axios from 'axios';

// একদম শেষে '/' নিশ্চিত করুন
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');
    const isAuthEndpoint = originalRequest?.url?.includes('google-login')
      || originalRequest?.url?.includes('token/refresh');

    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest?._retry || !refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/accounts/token/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const newAccessToken = refreshResponse.data.access;

      localStorage.setItem('access_token', newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
