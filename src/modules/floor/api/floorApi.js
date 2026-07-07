import apiClient from "@/api/apiClient";

export const floorApi = {
  getFloors: async () => {
    const response = await apiClient.get("/floor");
    return response.data;
  },
  getFloorById: async (id) => {
    const response = await apiClient.get(`/floor/${id}`);
    return response.data;
  },
  createFloor: async (floorData) => {
    const formData = new FormData();
    Object.keys(floorData).forEach((key) => {
      formData.append(key, floorData[key]);
    });
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
