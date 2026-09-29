import apiClient from "@/api/apiClient";

export const requestApi = {
  getRequests: async (page = 1, search = "") => {
    const url = `/service-request?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  updateRequestStatus: async (id, status) => {
    const response = await apiClient.patch(`/service-requests/${id}/status`, {
      services_request_status: status,
    });
    return response.data;
  },
};
