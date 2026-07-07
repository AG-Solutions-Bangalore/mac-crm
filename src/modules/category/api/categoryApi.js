import apiClient from "@/api/apiClient";

export const categoryApi = {
  getCategories: async (page = 1) => {
    const response = await apiClient.get(`/category?page=${page}`);
    return response.data;
  },
  getCategoryById: async (id) => {
    const response = await apiClient.get(`/category/${id}`);
    return response.data;
  },
  createCategory: async (name) => {
    const formData = new FormData();
    formData.append("category_name", name);
    const response = await apiClient.post("/category", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateCategory: async (id, name, status) => {
    const response = await apiClient.put(`/category/${id}`, {
      category_name: name,
      category_status: status,
    });
    return response.data;
  },
  updateCategoryStatus: async (id, status) => {
    const response = await apiClient.patch(`/categorys/${id}/status`, {
      category_status: status,
    });
    return response.data;
  },
  getActiveCategories: async () => {
    const response = await apiClient.get("/activeCategorys");
    return response.data;
  },
};
