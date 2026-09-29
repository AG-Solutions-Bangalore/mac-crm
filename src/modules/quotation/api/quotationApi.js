import apiClient from "@/api/apiClient";

export const quotationApi = {
  // Fetch products by categories and services (Form-Data)
  getProductsForQuotation: async (categoryIds, serviceIds) => {
    // Normalise inputs to clean comma-separated strings
    const normaliseParam = (val) => {
      if (!val) return "";
      if (Array.isArray(val)) return val.join(",");
      return val.toString().trim();
    };

    const cleanCategoryIds = normaliseParam(categoryIds);
    const cleanServiceIds = normaliseParam(serviceIds);

    console.group("🔍 API Request: /getProducts");
    console.log("Raw categoryIds passed:", categoryIds);
    console.log("Raw serviceIds passed:", serviceIds);
    console.log("Normalized category_ids sent:", cleanCategoryIds);
    console.log("Normalized service_ids sent:", cleanServiceIds);
    console.groupEnd();

    const formData = new FormData();
    formData.append("category_ids", cleanCategoryIds);
    formData.append("service_ids", cleanServiceIds);

    try {
      const response = await apiClient.post("/getProducts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.group("✅ API Response: /getProducts (Success)");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.groupEnd();
      
      return response.data;
    } catch (error) {
      console.group("❌ API Response: /getProducts (Error)");
      console.error("Error Message:", error.message);
      if (error.response) {
        console.error("Response Status:", error.response.status);
        console.error("Response Data:", error.response.data);
      }
      console.groupEnd();
      throw error;
    }
  },

  // Quotation CRUD
  getQuotations: async (page = 1, search = "") => {
    const url = `/quotation?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
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
  getRevQuotations: async (quotationId, page = 1, search = "") => {
    const url = `/rev-quotation?id=${quotationId}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
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
