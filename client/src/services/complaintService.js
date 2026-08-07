import apiClient from "../api/client.js";

export const submitComplaint = async (formData) => {
  const response = await apiClient.post("/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const getComplaintByPublicId = async (id) => {
  const response = await apiClient.get(`/complaints/${id}`);
  return response.data.data;
};