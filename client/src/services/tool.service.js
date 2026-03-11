import apiClient from "./api";

/**
 * Tool Service
 * Handles all tool-related API calls to the Node.js backend.
 */
const toolService = {
  // 1. Create a new tool listing (Supports Image Uploads)
  createTool: async (toolFormData) => {
    try {
      const response = await apiClient.post('/items', toolFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to list tool. Please try again." };
    }
  },

  // 2. Fetch all tools (with filters, search, and pagination)
  getAllTools: async (params) => {
    try {
      const response = await apiClient.get('/items', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch tools." };
    }
  },

  // 3. Fetch nearby tools using Geo-Location (lat, lng, distance)
  getNearbyTools: async (params) => {
    try {
      const response = await apiClient.get('/items/near', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch nearby tools." };
    }
  },

  // 4. Fetch a single tool by its ID
  getToolById: async (id) => {
    try {
      const response = await apiClient.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch tool details." };
    }
  },

  // 5. Fetch tools owned by the currently logged-in user
  getMyTools: async () => {
    try {
      const response = await apiClient.get('/items/my-items');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch your items." };
    }
  },

  // 6. Update an existing tool
  updateTool: async (id, toolData) => {
    try {
      const isFormData = toolData instanceof FormData;
      const response = await apiClient.patch(`/items/${id}`, toolData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update tool." };
    }
  },

  // 7. Delete a tool
  deleteTool: async (id) => {
    try {
      const response = await apiClient.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete tool." };
    }
  },

  // ✅ 8. Toggle item availability (Matches your Backend Controller)
  toggleAvailability: async (id) => {
    try {
      const response = await apiClient.patch(`/items/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to toggle status." };
    }
  }
};

export default toolService;