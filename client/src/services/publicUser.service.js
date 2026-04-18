import apiClient from "./api";

const publicUserService = {
  getPublicProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user profile." };
    }
  }
};

export default publicUserService;

