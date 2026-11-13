import apiClient from "@/api/apiClient";

export const projectApi = {
  // Project CRUD
  getProjects: async (page = 1, search = "", status = "", year = "") => {
    let url = `/project?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    if (status && status !== "all") {
      url += `&status=${encodeURIComponent(status)}&filter=${encodeURIComponent(status)}`;
    }
    if (year && year !== "all") {
      url += `&year=${encodeURIComponent(year)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await apiClient.get(`/project/${id}`);
    return response.data;
  },

  getOngoingProjects: async (page = 1, search = "", year = "") => {
    let url = `/getOngoingProject?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (year && year !== "all") {
      url += `&year=${encodeURIComponent(year)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getCompleteProjects: async (page = 1, search = "", year = "") => {
    let url = `/getCompleteProject?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (year && year !== "all") {
      url += `&year=${encodeURIComponent(year)}`;
    }
    const response = await apiClient.get(url);
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
      quotation_status: status,
      project_status: status,
      status: status,
    });
    return response.data;
  },

  updateProjectStartDate: async (id, startDate) => {
    const response = await apiClient.put(`/update-project-start-date/${id}`, {
      project_start_date: startDate,
    });
    return response.data;
  },

  updateProjectFinishWorkDate: async (id, finishWorkDate) => {
    const response = await apiClient.put(
      `/update-project-finish-work-date/${id}`,
      {
        quotation_finish_work_date: finishWorkDate,
      }
    );
    return response.data;
  },
};
