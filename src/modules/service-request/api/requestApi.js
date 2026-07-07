import apiClient from "@/api/apiClient";

export const requestApi = {
  getRequests: async (page = 1) => {
    const response = await apiClient.get(`/service-request?page=${page}`);
    return response.data;
  },
  updateRequestStatus: async (id, status) => {
    const response = await apiClient.patch(`/service-requests/${id}/status`, {
      services_request_status: status,
    });
    return response.data;
  },
};
