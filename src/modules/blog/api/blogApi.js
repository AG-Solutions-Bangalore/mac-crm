import apiClient from "@/api/apiClient";

export const blogApi = {
  getBlogs: async () => {
    const response = await apiClient.get("/blog");
    return response.data;
  },
  getBlogById: async (id) => {
    const response = await apiClient.get(`/blog/${id}`);
    return response.data;
  },
  createBlog: async (formData) => {
    const response = await apiClient.post("/blog", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateBlog: async (id, formData) => {
    const response = await apiClient.post(`/blog/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  deleteBlog: async (id) => {
    const response = await apiClient.delete(`/blog/${id}`);
    return response.data;
  },
  deleteBlogSub: async (subId) => {
    const response = await apiClient.delete(`/blog-sub/${subId}`);
    return response.data;
  },
  deleteBlogRelated: async (relatedId) => {
    const response = await apiClient.delete(`/blog-related/${relatedId}`);
    return response.data;
  },
  getBlogsDropdown: async () => {
    const response = await apiClient.get("/blogs");
    return response.data;
  },
  getCourses: async () => {
    const response = await apiClient.get("/courses");
    return response.data;
  },
};
