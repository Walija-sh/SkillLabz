import axios from 'axios';

const normalizeApiBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return null;
  const trimmed = String(rawBaseUrl).trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolvedBaseURL = (() => {
  const envUrl = import.meta.env.DEV
    ? normalizeApiBaseUrl(import.meta.env.VITE_API_URL_DEV)
    : normalizeApiBaseUrl(import.meta.env.VITE_API_URL_PROD);

  if (envUrl) return envUrl;

  const legacy = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  if (legacy) return legacy;

  if (import.meta.env.DEV) return 'http://localhost:3100/api';
  return 'https://skill-labz-backend.vercel.app/api';
})();

const apiClient = axios.create({
  baseURL: resolvedBaseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const submitVerification = async (formData) => {
  const response = await apiClient.post('/verification/request', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const getMyRequest = async () => {
  const response = await apiClient.get('/verification/me');
  return response.data;
};

const verificationService = { submitVerification, getMyRequest };
export default verificationService;