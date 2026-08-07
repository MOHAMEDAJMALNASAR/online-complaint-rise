import apiClient from "../api/client.js";

export const adminLogin = async (email, password) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data.data;
};

export const getComplaints = async (params = {}) => {
  const response = await apiClient.get("/admin", { params });
  return {
    complaints: response.data.data,
    pagination: response.data.pagination,
  };
};

export const getComplaintStats = async () => {
  const response = await apiClient.get("/admin/stats");
  return response.data.data;
};

export const getComplaint = async (id) => {
  const response = await apiClient.get(`/admin/${id}`);
  return response.data.data;
};

export const updateComplaint = async (id, payload) => {
  const response = await apiClient.put(`/admin/${id}`, payload);
  return response.data.data;
};

export const deleteComplaint = async (id) => {
  const response = await apiClient.delete(`/admin/${id}`);
  return response.data;
};

export const bulkUpdateStatus = async (ids, status) => {
  const response = await apiClient.post("/admin/bulk-status", { ids, status });
  return response.data.data;
};

export const bulkDelete = async (ids) => {
  const response = await apiClient.post("/admin/bulk-delete", { ids });
  return response.data.data;
};