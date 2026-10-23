import apiClient from "@/api/apiClient";

export const salesTeamApi = {
  getMembers: async (page = 1, search = "") => {
    const url = `/panel-fetch-sales-team-list?page=${page}${
      search ? `&search=${encodeURIComponent(search)}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getMemberById: async (id) => {
    const response = await apiClient.get(`/panel-fetch-sales-team-by-id/${id}`);
    return response.data;
  },

  getActiveMembers: async () => {
    const response = await apiClient.get("/panel-fetch-sales-team");
    return response.data;
  },

  createMember: async (data) => {
    const response = await apiClient.post("/create-sales-team", {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
    });
    return response.data;
  },

  updateMember: async (id, data) => {
    const response = await apiClient.put(`/panel-update-sales-team/${id}`, {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      status: data.status,
    });
    return response.data;
  },
};

// API responses sometimes expose the member key differently — normalize it.
const ID_KEYS = [
  "id",
  "sales_team_id",
  "salesTeamId",
  "member_id",
  "memberId",
  "sales_team_member_id",
  "salesTeamMemberId",
  "team_id",
  "teamId",
  "user_id",
  "userId",
  "employee_id",
  "employeeId",
];

export const getSalesTeamMemberId = (member) => {
  if (!member || typeof member !== "object") return "";
  for (const key of ID_KEYS) {
    if (member[key] !== undefined && member[key] !== null && member[key] !== "") {
      return member[key];
    }
  }
  const fallbackKey = Object.keys(member).find(
    (key) =>
      /(^id$|_id$)/i.test(key) &&
      member[key] !== undefined &&
      member[key] !== null &&
      member[key] !== ""
  );
  return fallbackKey ? member[fallbackKey] : "";
};
