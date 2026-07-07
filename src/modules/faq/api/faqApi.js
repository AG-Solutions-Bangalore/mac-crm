import apiClient from "@/api/apiClient";

export const faqApi = {
  getFaqs: async () => {
    const response = await apiClient.get("/faq");
    return response.data;
  },
  getFaqById: async (id) => {
    const response = await apiClient.get(`/faq/${id}`);
    return response.data;
  },
  createFaq: async (payload) => {
    const response = await apiClient.post("/faq", payload);
    return response.data;
  },
  updateFaq: async (id, payload) => {
    const response = await apiClient.put(`/faq/${id}`, payload);
    return response.data;
  },
  updateFaqStatus: async (id, status) => {
    const response = await apiClient.patch(`/faqs/${id}/status`, {
      faq_status: status,
    });
    return response.data;
  },
  deleteFaqSub: async (faqSubId) => {
    const response = await apiClient.delete(`/faqSub/${faqSubId}`);
    return response.data;
  },
  getPageTwoDropdown: async () => {
    const response = await apiClient.get("/pageTwoDropdown");
    return response.data;
  },
};
