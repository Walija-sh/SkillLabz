import axios from 'axios';

const normalizeApiBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return null;
  const trimmed = String(rawBaseUrl).trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const resolvedBaseURL = (() => {
  const rawBaseUrl = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL_PROD;

  const normalized = normalizeApiBaseUrl(rawBaseUrl);

  if (!normalized) {
    throw new Error("API base URL is not defined. Check your environment variables.");
  }

  return normalized;
})();

const apiClient = axios.create({
  // Uses your local .env file during development, and falls back to Vercel for production
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach the JWT for secure routes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Catch expired tokens globally
apiClient.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the response
    return response;
  },
  (error) => {
    // If the backend says the token is invalid or expired (401), automatically log them out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Optional: Force redirect to login page if they are booted out
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;