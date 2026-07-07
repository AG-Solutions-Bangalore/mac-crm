import apiClient from "@/api/apiClient";

export const lectureApi = {
  // Lectures
  getLectures: async () => {
    const response = await apiClient.get("/lectureYoutube");
    return response.data;
  },
  getLectureById: async (id) => {
    const response = await apiClient.get(`/lectureYoutube/${id}`);
    return response.data;
  },
  createLecture: async (formData) => {
    const response = await apiClient.post("/lectureYoutube", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateLecture: async (id, formData) => {
    const response = await apiClient.post(`/lectureYoutube/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Playlists
  getPlaylists: async () => {
    const response = await apiClient.get("/lecture-youtube-playlist");
    return response.data;
  },
  createPlaylist: async (payload) => {
    const response = await apiClient.post("/lecture-youtube-playlist", payload);
    return response.data;
  },
  updatePlaylist: async (id, payload) => {
    const response = await apiClient.put(`/lecture-youtube-playlist/${id}`, payload);
    return response.data;
  },
  getActivePlaylists: async () => {
    const response = await apiClient.get("/lecture-youtube-playlists");
    return response.data;
  },

  // Dropdowns / Utilities
  getYoutubeFor: async () => {
    const response = await apiClient.get("/youtubeFor");
    return response.data;
  },
  getCourses: async () => {
    const response = await apiClient.get("/courses");
    return response.data;
  },
};
