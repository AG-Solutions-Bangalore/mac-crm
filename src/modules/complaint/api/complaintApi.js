import apiClient from "@/api/apiClient";

export const complaintApi = {
  getComplaints: async (page = 1, search = "") => {
    const url = `/complaint?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  updateComplaintStatus: async (id, status) => {
    const response = await apiClient.patch(`/complaints/${id}/status`, {
      complaint_status: status,
    });
    return response.data;
  },
};
