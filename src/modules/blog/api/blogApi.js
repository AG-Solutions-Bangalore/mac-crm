import apiClient from "@/api/apiClient";

/**
 * Blog API — MAKC CRM
 *
 * Endpoints:
 *   GET    /blog                       → list
 *   GET    /blog/{id}                  → single blog
 *   POST   /blog                       → create (multipart, includes blog_banner_image)
 *   POST   /blog/{id}?_method=PUT      → update (multipart, _method override)
 *   PATCH  /blogs/{id}/status          → toggle blog_status (Active / Inactive)
 *
 * Plus the shared /activeServices endpoint, reused for the
 * `blog_categories_ids` multi-select dropdown.
 */
export const blogApi = {
  getBlogs: async (page = 1) => {
    const response = await apiClient.get(`/blog?page=${page}`);
    return response.data;
  },

  getBlogById: async (id) => {
    const response = await apiClient.get(`/blog/${id}`);
    return response.data;
  },

  createBlog: async (formData) => {
    const response = await apiClient.post("/blog", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateBlog: async (id, formData) => {
    const response = await apiClient.post(`/blog/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateBlogStatus: async (id, status) => {
    const response = await apiClient.patch(`/blogs/${id}/status`, {
      blog_status: status,
    });
    return response.data;
  },

  // Shared endpoint — used for the blog_categories_ids multi-select.
  getActiveServices: async () => {
    const response = await apiClient.get("/activeServices");
    return response.data;
  },
};
