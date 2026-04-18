import apiClient from "./api";

const reviewService = {
  getReviewsForUser: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/reviews/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch reviews." };
    }
  },

  createReview: async (payload) => {
    try {
      const response = await apiClient.post("/reviews", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create review." };
    }
  }
};

export default reviewService;

