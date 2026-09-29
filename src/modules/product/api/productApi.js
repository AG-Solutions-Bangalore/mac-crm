import apiClient from "@/api/apiClient";

export const productApi = {
  getProducts: async (page = 1, search = "") => {
    const url = `/product?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  getProductById: async (id) => {
    const response = await apiClient.get(`/product/${id}`);
    return response.data;
  },
  createProduct: async (data) => {
    const formData = new FormData();
    formData.append("service_id", data.service_id);
    formData.append("category_id", data.category_id);
    formData.append("brand_id", data.brand_id);
    formData.append("product_module", data.product_module);
    formData.append("product_name", data.product_name);
    formData.append("product_warranty", data.product_warranty);
    formData.append("product_price", data.product_price);

    const response = await apiClient.post("/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/product/${id}`, {
      service_id: Number(data.service_id),
      category_id: Number(data.category_id),
      brand_id: Number(data.brand_id),
      product_module: data.product_module,
      product_name: data.product_name,
      product_warranty: data.product_warranty,
      product_price: data.product_price,
      product_status: data.product_status,
    });
    return response.data;
  },
  updateProductStatus: async (id, status) => {
    const response = await apiClient.patch(`/products/${id}/status`, {
      product_status: status,
    });
    return response.data;
  },
};
