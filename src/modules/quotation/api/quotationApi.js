import apiClient from "@/api/apiClient";

export const quotationApi = {
  // Fetch products by categories and services (Form-Data)
  getProductsForQuotation: async (categoryIds, serviceIds) => {
    const formData = new FormData();
    formData.append("category_ids", categoryIds);
    formData.append("service_ids", serviceIds);
    const response = await apiClient.post("/getProducts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Quotation CRUD
  getQuotations: async (page = 1) => {
    const response = await apiClient.get(`/quotation?page=${page}`);
    return response.data;
  },
  getQuotationById: async (id) => {
    const response = await apiClient.get(`/quotation/${id}`);
    return response.data;
  },
  createQuotation: async (data) => {
    const response = await apiClient.post("/quotation", data);
    return response.data;
  },
  updateQuotation: async (id, data) => {
    const response = await apiClient.put(`/quotation/${id}`, data);
    return response.data;
  },
  updateQuotationStatus: async (id, status) => {
    const response = await apiClient.patch(`/quotations/${id}/status`, {
      quotation_status: status,
    });
    return response.data;
  },
  deleteQuotationSub: async (id) => {
    const response = await apiClient.delete(`/quotation-sub/${id}`);
    return response.data;
  },

  // Revised Quotation CRUD
  getRevQuotations: async (quotationId, page = 1) => {
    const response = await apiClient.get(`/rev-quotation?id=${quotationId}&page=${page}`);
    return response.data;
  },
  getRevQuotationById: async (id) => {
    const response = await apiClient.get(`/rev-quotation/${id}`);
    return response.data;
  },
  createRevQuotation: async (data) => {
    const response = await apiClient.post("/rev-quotation", data);
    return response.data;
  },
  updateRevQuotation: async (id, data) => {
    const response = await apiClient.put(`/rev-quotation/${id}`, data);
    return response.data;
  },
  updateRevQuotationStatus: async (id, status) => {
    const response = await apiClient.patch(`/rev-quotations/${id}/status`, {
      quotation_status: status,
    });
    return response.data;
  },
  deleteRevQuotationSub: async (id) => {
    const response = await apiClient.delete(`/rev-quotation-sub/${id}`);
    return response.data;
  },
  approveRevQuotation: async (id) => {
    const response = await apiClient.put(`/rev-quotation-approved/${id}`);
    return response.data;
  },
  updateQuotationFinishWorkDate: async (id, finishWorkDate) => {
    const response = await apiClient.put(`/update-quotation-finish-work-date/${id}`, {
      quotation_finish_work_date: finishWorkDate,
    });
    return response.data;
  },
};
