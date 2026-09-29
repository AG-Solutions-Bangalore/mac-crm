import apiClient from "@/api/apiClient";

export const floorApi = {
  getFloors: async (page = 1, search = "") => {
    const params = [];
    if (page) params.push(`page=${page}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const qs = params.length ? `?${params.join("&")}` : "";
    const response = await apiClient.get(`/floor${qs}`);
    return response.data;
  },
  getFloorById: async (id) => {
    const response = await apiClient.get(`/floor/${id}`);
    return response.data;
  },
  createFloor: async (floorData) => {
    const formData = new FormData();
    formData.append("property_floor", floorData.property_floor);
    const response = await apiClient.post("/floor", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateFloor: async (id, floorData) => {
    // Send as JSON for PUT request
    const response = await apiClient.put(`/floor/${id}`, floorData);
    return response.data;
  },
  updateFloorStatus: async (id, status) => {
    const response = await apiClient.patch(`/floors/${id}/status`, {
      property_floor_status: status,
    });
    return response.data;
  },
  getActiveFloors: async () => {
    const response = await apiClient.get("/activeFloors");
    return response.data;
  },
};
