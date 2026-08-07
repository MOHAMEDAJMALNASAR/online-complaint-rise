import apiClient from "../api/client.js";

export const registerCustomer = async ({ name, email, password }) => {
  const response = await apiClient.post("/customer/register", {
    name,
    email,
    password,
  });
  return response.data.data;
};

export const loginCustomer = async ({ email, password }) => {
  const response = await apiClient.post("/customer/login", {
    email,
    password,
  });
  return response.data.data;
};

export const getCustomerProfile = async () => {
  const response = await apiClient.get("/customer/me");
  return response.data.data;
};

export const getMyComplaints = async () => {
  const response = await apiClient.get("/customer/complaints");
  return response.data.data;
};
