
import axios from "./api"

// ==========================================
// PASSWORD RESET
// ==========================================
export const requestResetApi = (data) => axios.post("/auth/request-reset", data);

export const resetPasswordApi = (token, data) =>
  axios.post(`/auth/reset-password/${token}`, data);

// ==========================================
// AUTHENTICATION
// ==========================================
export const registerUserApi = (formData) =>
  axios.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const loginUserApi = (data) => axios.post("/auth/login", data);

export const logoutUserApi = () => axios.post("/auth/logout");

// ==========================================
// USER PROFILE
// ==========================================

export const getCurrentUserApi = () =>
  axios.get("/auth/me").then(res => res.data.data);

// Get user by ID - 
// This can be used for viewing own profile or admin viewing other users
export const getUserByIdApi = (id) =>
  axios.get(`/auth/${id}`).then(res => res.data.data);

// ✅ Update user profile
export const updateUserApi = (id, formData) =>
  axios.put(`/auth/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(res => res.data);

export const changePasswordApi = (id, data) =>
  axios.put(`/auth/${id}/change-password`, data).then(res => res.data);

