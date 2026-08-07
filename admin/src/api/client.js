import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes("/auth/");
      if (!isAuthRequest) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        if (
          window.location.pathname.startsWith("/admin") &&
          !window.location.pathname.startsWith("/admin/login")
        ) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;