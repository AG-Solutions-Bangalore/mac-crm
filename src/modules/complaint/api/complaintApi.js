import apiClient from "@/api/apiClient";

export const complaintApi = {
  getComplaints: async (page = 1) => {
    const response = await apiClient.get(`/complaint?page=${page}`);
    return response.data;
  },
  updateComplaintStatus: async (id, status) => {
    const response = await apiClient.patch(`/complaints/${id}/status`, {
      complaint_status: status,
    });
    return response.data;
  },
};
