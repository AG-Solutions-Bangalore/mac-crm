import apiClient from "@/api/apiClient";

export const projectApi = {
  // Project CRUD
  getProjects: async (page = 1, search = "", status = "") => {
    let url = `/project?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    if (status && status !== "all") {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await apiClient.get(`/project/${id}`);
    return response.data;
  },

  createProject: async (data) => {
    const response = await apiClient.post("/project", data);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await apiClient.put(`/project/${id}`, data);
    return response.data;
  },

  deleteProjectSub: async (id) => {
    const response = await apiClient.delete(`/project-sub/${id}`);
    return response.data;
  },

  updateProjectStatus: async (id, status) => {
    const response = await apiClient.patch(`/projects/${id}/status`, {
      project_status: status,
      status: status,
    });
    return response.data;
  },
};
