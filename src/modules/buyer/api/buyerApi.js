import apiClient from "@/api/apiClient";

export const buyerApi = {
  getBuyers: async (page = 1) => {
    const response = await apiClient.get(`/buyer?page=${page}`);
    return response.data;
  },
  getBuyerById: async (id) => {
    const response = await apiClient.get(`/buyer/${id}`);
    return response.data;
  },
  createBuyer: async (buyerData) => {
    const formData = new FormData();
    formData.append("buyer_name", buyerData.buyer_name);
    formData.append("buyer_mobile", buyerData.buyer_mobile);
    formData.append("buyer_email", buyerData.buyer_email);
    if (buyerData.buyer_address) {
      formData.append("buyer_address", buyerData.buyer_address);
    }
    const response = await apiClient.post("/buyer", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateBuyer: async (id, buyerData) => {
    const response = await apiClient.patch(`/buyer/${id}`, buyerData);
    return response.data;
  },
  updateBuyerStatus: async (id, status) => {
    const response = await apiClient.patch(`/buyers/${id}/status`, {
      buyer_status: status,
    });
    return response.data;
  },
  getActiveBuyers: async () => {
    const response = await apiClient.get("/activeBuyers");
    return response.data;
  },
};
