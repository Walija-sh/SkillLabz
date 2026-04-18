import axios from 'axios';

const normalizeApiBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return null;
  const trimmed = String(rawBaseUrl).trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const resolvedBaseURL = (() => {
  // Prefer explicit per-environment URLs
  const envUrl = import.meta.env.DEV
    ? normalizeApiBaseUrl(import.meta.env.VITE_API_URL_DEV)
    : normalizeApiBaseUrl(import.meta.env.VITE_API_URL_PROD);

  if (envUrl) return envUrl;

  // Backwards-compatible fallback
  const legacy = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  if (legacy) return legacy;

  if (import.meta.env.DEV) return "http://localhost:3100/api";
  return "https://skill-labz-backend.vercel.app/api";
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