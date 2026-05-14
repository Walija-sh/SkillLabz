import apiClient from "./api";

const rentalService = {
  // 1. Create a new rental request (Renter action)
  createRentalRequest: async (rentalData) => {
    try {
      const response = await apiClient.post('/rentals', rentalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to submit rental request." };
    }
  },

  // 2. Get rentals for tools owned by the logged-in user (Dashboard stat)
  getOwnerRentals: async () => {
    try {
      const response = await apiClient.get('/rentals/owner');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch your rentals." };
    }
  },

  // 3. Get my active/past rented items (For a future "My Borrowed Gear" page)
  getMyRentals: async () => {
    try {
      const response = await apiClient.get('/rentals/my-rentals');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch your rented items." };
    }
  },

  // 4. Approve a pending request
  approveRental: async (id, additionalTerms) => {
    try {
      const payload = {};
      if (typeof additionalTerms === "string") {
        payload.additionalTerms = additionalTerms;
      }
      const response = await apiClient.patch(`/rentals/${id}/approve`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to approve rental." };
    }
  },

  // 5. Reject a pending request
  rejectRental: async (id) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reject rental." };
    }
  },

  // 6. Start an approved rental (Hand-off)
  startRental: async (id) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to start rental." };
    }
  },

  // 7. Complete an active rental (Return)
  completeRental: async (id) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to complete rental." };
    }
  },
  cancelRental: async (id, cancellationReason) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/cancel`, { cancellationReason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to cancel rental." };
    }
  },
  getItemAvailability: async (id) => {
    try {
      const response = await apiClient.get(`/items/${id}/availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to load item availability." };
    }
  },

  // -------------------------
  // OTP EXTENSION (Owner generates, renter verifies)
  // -------------------------
  generateHandoverOtp: async (id) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/generate-handover-otp`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to generate handover OTP." };
    }
  },

  verifyHandoverOtp: async (id, otp) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/verify-handover-otp`, { otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to verify handover OTP." };
    }
  },

  generateReturnOtp: async (id) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/generate-return-otp`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to generate return OTP." };
    }
  },

  verifyReturnOtp: async (id, otp) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/verify-return-otp`, { otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to verify return OTP." };
    }
  },

  getRentalById: async (id) => {
    try {
      const response = await apiClient.get(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch rental details." };
    }
  },

  agreeContract: async (id) => {
    try {
      const response = await apiClient.patch(`/rentals/${id}/agree-contract`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to agree to contract." };
    }
  }
};

export default rentalService;