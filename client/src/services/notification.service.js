import apiClient from "./api";

const notificationService = {
  getMyNotifications: async () => {
    const response = await apiClient.get("/notifications");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data;
  }
};

export default notificationService;
