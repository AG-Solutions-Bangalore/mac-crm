import apiClient from "@/api/apiClient";

export const notificationApi = {
  getNotifications: async (page = 1, search = "") => {
    const url = `/notification?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  getNotificationById: async (id) => {
    const response = await apiClient.get(`/notification/${id}`);
    return response.data;
  },
  createNotification: async (formData) => {
    const response = await apiClient.post("/notification", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateNotification: async (id, formData) => {
    const response = await apiClient.post(`/notification/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateNotificationStatus: async (id, status) => {
    const response = await apiClient.patch(`/notifications/${id}/status`, {
      notification_status: status,
    });
    return response.data;
  },
};
