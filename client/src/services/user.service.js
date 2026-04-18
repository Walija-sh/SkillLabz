import axios from 'axios';

const normalizeApiBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return null;
  const trimmed = String(rawBaseUrl).trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const resolvedBaseURL = (() => {
  const envUrl = import.meta.env.DEV
    ? normalizeApiBaseUrl(import.meta.env.VITE_API_URL_DEV)
    : normalizeApiBaseUrl(import.meta.env.VITE_API_URL_PROD);
  if (envUrl) return envUrl;

  const legacy = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  if (legacy) return legacy;

  if (import.meta.env.DEV) return "http://localhost:3100/api";
  return "https://skill-labz-backend.vercel.app/api";
})();

const API = axios.create({
  baseURL: resolvedBaseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const userService = {
  /**
   * Updates user profile with GeoJSON coordinates.
   */
  completeProfile: async (profileData) => {
    const response = await API.patch('/auth/complete-profile', profileData);
    return response.data;
  },

  /**
   * Fetches current user profile.
   */
  getProfile: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  /**
   * Uploads a profile picture to Cloudinary via the backend.
   */
  uploadProfileImage: async (formData) => {
    const response = await API.patch('/auth/upload-profile-image', formData);
    return response.data;
  },

  /**
   * Requests the backend to send a verification email.
   */
  sendVerificationEmail: async () => {
    const response = await API.post('/auth/send-verification-email');
    return response.data;
  },

  /**
   * Sends the token from the URL to the backend to verify the email.
   * Switched to API.get to match standard email link routing.
   */
  verifyEmailToken: async (token) => {
    const response = await API.get(`/auth/verify-email/${token}`);
    return response.data;
  }
};

export default userService;