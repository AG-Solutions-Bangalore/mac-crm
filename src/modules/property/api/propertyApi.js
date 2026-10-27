import apiClient from "@/api/apiClient";

export const propertyApi = {
  getProperties: async (page = 1, search = "", status = "all") => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("filter", status);
    const response = await apiClient.get(`/property?${params.toString()}`);
    return response.data;
  },
  getPropertyById: async (id) => {
    const response = await apiClient.get(`/property/${id}`);
    return response.data;
  },
  createProperty: async (propertyData) => {
    const formData = new FormData();
    formData.append("property", propertyData.property);
    const response = await apiClient.post("/property", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateProperty: async (id, propertyData) => {
    // Send as JSON for PUT request
    const response = await apiClient.put(`/property/${id}`, propertyData);
    return response.data;
  },
  updatePropertyStatus: async (id, status) => {
    const response = await apiClient.patch(`/propertys/${id}/status`, {
      property_status: status,
    });
    return response.data;
  },
  getActiveProperties: async () => {
    const response = await apiClient.get("/activePropertys");
    return response.data;
  },
};
