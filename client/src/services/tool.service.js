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
        headers: {
          // Axios automatically sets the boundary for multipart/form-data, 
          // but it's good practice to explicitly state the content type for file uploads.
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to list tool. Please try again." };
    }
  },

  // Future methods will go here (e.g., getTools, getToolById, updateTool, deleteTool)
};

export default toolService;