import apiClient from "./api";

/**
 * Authentication Service
 * Handles all identity and session-related API calls to the Vercel-hosted Node.js backend.
 */
const authService = {
  // 1. Create a new user account & Auto-Login
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      // Backend now returns token on signup, so we store it for instant login
      const token = response.data?.data?.token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Network error. Please try again." };
    }
  },

  // 2. Authenticate existing user and receive JWT
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      const token = response.data?.data?.token || response.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Invalid credentials or server error." };
    }
  },

  // 3. Send Verification Email (Protected Route - User must be logged in)
  sendVerificationEmail: async () => {
    try {
      // Assuming your backend route is POST /auth/send-verification-email
      const response = await apiClient.post('/auth/send-verification-email');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send verification email." };
    }
  },

  // 4. Verify Email Token
  verifyEmail: async (token) => {
    try {
      // Passes the token from the URL params to your backend
      // Assuming your backend route is setup as GET or POST /auth/verify-email/:token
      // We will use GET as it is standard for link clicks, but you can change to .post() if your router uses POST
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Verification failed. Token may be invalid or expired." };
    }
  },

  // 5. KYC/Identity Verification status
  verifyIdentity: async (verificationData) => {
    try {
      const response = await apiClient.post('/auth/verify-kyc', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Verification failed. Please check your documents." };
    }
  },

  // 6. Logout (Clear local session)
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;