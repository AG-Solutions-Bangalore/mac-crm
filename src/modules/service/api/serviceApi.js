import apiClient from "@/api/apiClient";

export const serviceApi = {
  getServices: async (page = 1) => {
    const response = await apiClient.get(`/service?page=${page}`);
    return response.data;
  },
  getServiceById: async (id) => {
    const response = await apiClient.get(`/service/${id}`);
    return response.data;
  },
  createService: async (formData) => {
    const response = await apiClient.post("/service", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateService: async (id, formData) => {
    const response = await apiClient.post(`/service/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateServiceStatus: async (id, status) => {
    const response = await apiClient.patch(`/services/${id}/status`, {
      service_status: status,
    });
    return response.data;
  },
  deleteServiceSub: async (subId) => {
    const response = await apiClient.delete(`/service-sub/${subId}`);
    return response.data;
  },
  getActiveServices: async () => {
    const response = await apiClient.get("/activeServices");
    return response.data;
  },
};
