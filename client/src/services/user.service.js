import apiClient from './api';

const userService = {
  /**
   * Updates user profile with GeoJSON coordinates.
   */
  completeProfile: async (profileData) => {
    const response = await apiClient.patch('/auth/complete-profile', profileData);
    return response.data;
  },

  /**
   * Fetches current user profile.
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Uploads a profile picture to Cloudinary via the backend.
   */
  uploadProfileImage: async (formData) => {
    const response = await apiClient.patch('/auth/upload-profile-image', formData);
    return response.data;
  },

  /**
   * Requests the backend to send a verification email.
   */
  sendVerificationEmail: async () => {
    const response = await apiClient.post('/auth/send-verification-email');
    return response.data;
  },

  /**
   * Sends the token from the URL to the backend to verify the email.
   * Switched to apiClient.get to match standard email link routing.
   */
  verifyEmailToken: async (token) => {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  },
  // -------------------------
// PAYMENT METHODS
// -------------------------

getMyPaymentMethods: async () => {
  const response = await apiClient.get('/users/me/payment-methods');
  return response.data;
},

addPaymentMethod: async (data) => {
  const response = await apiClient.post('/users/payment-methods', data);
     console.log(response);
  return response.data;
},

updatePaymentMethod: async (id, data) => {
  const response = await apiClient.patch(`/users/payment-methods/${id}`, data);
  return response.data;
},

deletePaymentMethod: async (id) => {
  const response = await apiClient.delete(`/users/payment-methods/${id}`);
  return response.data;
},
};

export default userService;