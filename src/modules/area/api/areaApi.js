import apiClient from "@/api/apiClient";

export const areaApi = {
  getAreas: async (page = 1) => {
    const response = await apiClient.get(`/area?page=${page}`);
    return response.data;
  },
  getAreaById: async (id) => {
    const response = await apiClient.get(`/area/${id}`);
    return response.data;
  },
  createArea: async (areaData) => {
    const formData = new FormData();
    if (typeof areaData === "string") {
      formData.append("property_area", areaData);
    } else {
      formData.append("property_area", areaData.property_area);
    }
    const response = await apiClient.post("/area", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateArea: async (id, name, status) => {
    const response = await apiClient.put(`/area/${id}`, {
      property_area: name,
      property_area_status: status,
    });
    return response.data;
  },
  updateAreaStatus: async (id, status) => {
    const response = await apiClient.patch(`/areas/${id}/status`, {
      property_area_status: status,
    });
    return response.data;
  },
  getActiveAreas: async () => {
    const response = await apiClient.get("/activeAreas");
    return response.data;
  },
};
