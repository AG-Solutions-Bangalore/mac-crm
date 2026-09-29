import apiClient from "@/api/apiClient";

export const clientApi = {
  getClients: async (page = 1, search = "") => {
    const url = `/member?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  getClientById: async (id) => {
    const response = await apiClient.get(`/member/${id}`);
    return response.data;
  },
  createClient: async (formData) => {
    const response = await apiClient.post("/member", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateClient: async (id, formData) => {
    // PHP/Laravel does not natively parse multipart/form-data on PUT/PATCH requests, so we use POST with ?_method=PUT
    const response = await apiClient.post(`/member/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateClientStatus: async (id, status) => {
    const response = await apiClient.patch(`/members/${id}/status`, {
      status,
    });
    return response.data;
  },
};
