import BASE_URL from "@/config/base-url";
import { store } from "@/store/store";
import { performAppLogout } from "@/utils/logout";
import axios from "axios";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_ENDPOINTS = ["/panel-login", "/panel-send-password"];

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) =>
      requestUrl.includes(url)
    );

    if (status === 401 && !isAuthEndpoint) {
      performAppLogout();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
