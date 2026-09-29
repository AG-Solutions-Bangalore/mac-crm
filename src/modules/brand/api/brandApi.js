import apiClient from "@/api/apiClient";

export const brandApi = {
  getBrands: async (page = 1, search = "") => {
    const url = `/brand?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  getBrandById: async (id) => {
    const response = await apiClient.get(`/brand/${id}`);
    return response.data;
  },
  createBrand: async (name) => {
    const formData = new FormData();
    formData.append("brand_name", name);
    const response = await apiClient.post("/brand", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateBrand: async (id, name, status) => {
    const response = await apiClient.put(`/brand/${id}`, {
      brand_name: name,
      brand_status: status,
    });
    return response.data;
  },
  updateBrandStatus: async (id, status) => {
    const response = await apiClient.patch(`/brands/${id}/status`, {
      brand_status: status,
    });
    return response.data;
  },
  getActiveBrands: async () => {
    const response = await apiClient.get("/activeBrands");
    return response.data;
  },
};
