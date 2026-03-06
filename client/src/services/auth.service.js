import apiClient from "./api";

/**
 * Authentication Service
 * Handles all identity and session-related API calls to the Vercel-hosted Node.js backend.
 */
const authService = {
  // 1. Create a new user account
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Normalizing the error structure for the UI to catch 
      throw error.response?.data || { message: "Network error. Please try again." };
    }
  },

  // 2. Authenticate existing user and receive JWT
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // If your backend returns a token, we store it for persistent sessions 
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      // Handles 401 Unauthorized or 404 User Not Found from Vercel 
      throw error.response?.data || { message: "Invalid credentials or server error." };
    }
  },

  // 3. KYC/Identity Verification status
  // Critical for the trust-based SkillLabz ecosystem as per SRS [cite: 4, 7]
  verifyIdentity: async (verificationData) => {
    try {
      const response = await apiClient.post('/auth/verify-kyc', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Verification failed. Please check your documents." };
    }
  },

  // 4. Logout (Clear local session)
  logout: () => {
    localStorage.removeItem('token');
    // Optional: You could also add a backend call to blacklist the token here if supported.
  }
};

export default authService;