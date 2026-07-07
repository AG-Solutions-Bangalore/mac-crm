import apiClient from "@/api/apiClient";

export const galleryApi = {
  getGalleryList: async () => {
    const response = await apiClient.get("/link-gallery");
    return response.data;
  },
  getGalleryById: async (id) => {
    const response = await apiClient.get(`/link-gallery/${id}`);
    return response.data;
  },
  createGallery: async (formData) => {
    const response = await apiClient.post("/link-gallery", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateGallery: async (id, formData) => {
    const response = await apiClient.post(`/link-gallery/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
