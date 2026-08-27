import apiClient from "@/api/apiClient";

/**
 * Gallery API — MAKC CRM
 *
 * Endpoints:
 *   GET    /gallery                 → list
 *   GET    /gallery/{id}            → single gallery item
 *   POST   /gallery                 → create (multipart, gallery_image)
 *   POST   /gallery/{id}?_method=PUT → update (multipart)
 *   GET    /activeGallerys          → active list (for dropdowns)
 *   PATCH  /gallerys/{id}/status    → toggle gallery_status (Active / Inactive)
 */
export const galleryApi = {
  getGalleries: async (page = 1) => {
    const response = await apiClient.get(`/gallery?page=${page}`);
    return response.data;
  },

  getGalleryById: async (id) => {
    const response = await apiClient.get(`/gallery/${id}`);
    return response.data;
  },

  createGallery: async (formData) => {
    const response = await apiClient.post("/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateGallery: async (id, formData) => {
    const response = await apiClient.post(`/gallery/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getActiveGalleries: async () => {
    const response = await apiClient.get("/activeGallerys");
    return response.data;
  },

  updateGalleryStatus: async (id, status) => {
    const response = await apiClient.patch(`/gallerys/${id}/status`, {
      gallery_status: status,
    });
    return response.data;
  },
};
