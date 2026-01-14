import axios from "./api"

export const requestResetApi = (data) => axios.post("/auth/request-reset", data);

export const resetPasswordApi = (token, data) =>
  axios.post(`/auth/reset-password/${token}`, data);

export const registerUserApi = (formData) =>
  axios.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const loginUserApi = (data) => axios.post("/auth/login", data);

// 🔒 NEW: Logout API
export const logoutUserApi = () => axios.post("/auth/logout");

export const getCurrentUserApi = () =>
  axios.get("/auth/me").then(res => res.data.data);

export const getUserByIdApi = (id) =>
  axios.get(`/admin/users/${id}`).then(res => res.data.data);

export const updateUserApi = (id, formData) =>
  axios.put(`/auth/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);