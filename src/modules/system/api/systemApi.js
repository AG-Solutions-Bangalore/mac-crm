import apiClient from "@/api/apiClient";

export const systemApi = {
  checkStatus: async () => {
    const response = await apiClient.get("/panel-check-status");
    return response.data;
  },
  fetchDotenv: async () => {
    const response = await apiClient.get("/panel-fetch-dotenv");
    return response.data;
  },
};
