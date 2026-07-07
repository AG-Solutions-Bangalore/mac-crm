import apiClient from "@/api/apiClient";

export const authApi = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    const response = await apiClient.post("/panel-login", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  forgotPassword: async (username, email) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    const response = await apiClient.post("/panel-send-password", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  changePassword: async (username, oldPassword, newPassword) => {
    const response = await apiClient.post("/panel-change-password", {
      username,
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
  fetchProfile: async () => {
    const response = await apiClient.get("/panel-fetch-profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await apiClient.put("/panel-update-profile", data);
    return response.data;
  },
};
