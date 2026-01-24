
import {
  loginUserApi,
  logoutUserApi,
  registerUserApi,
  getUserByIdApi,
  updateUserApi,
  requestResetApi,
  resetPasswordApi,
  getCurrentUserApi // ✅ ADDED
} from "../api/authApi";

// ==========================================
// PASSWORD RESET
// ==========================================
export const requestResetService = async (email) => {
  return await requestResetApi({ email });
};

export const resetPasswordService = async (token, password) => {
  return await resetPasswordApi(token, { password });
};

// ==========================================
// AUTHENTICATION
// ==========================================
export const registerUserService = async (formData) => {
  try {
    const response = await registerUserApi(formData)
    return response.data // response body
  } catch (err) {
    throw err.response?.data || { message: "Registration Failed" }
  }
}

export const loginUserService = async (formData) => {
  try {
    const response = await loginUserApi(formData)
    console.log("📦 Login API Response:", response.data);
    return response.data
  } catch (err) {
    throw err.response?.data || { message: "Login Failed" }
  }
}

export const logoutUserService = async () => {
  try {
    await logoutUserApi(); // Clears HTTP-only cookie on backend
    localStorage.removeItem("user");
    return { success: true };
  } catch (err) {
    throw err.response?.data || { message: "Logout Failed" };
  }
};

// ==========================================
// USER PROFILE
// ==========================================

// ✅ NEW: Get current authenticated user (primary method for profile page)
export const getCurrentUserService = async () => {
  try {
    const data = await getCurrentUserApi()
    return data
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch user" }
  }
}

// ✅ UPDATED: Get user by ID (fallback method)
export const getUserService = async (id) => {
  try {
    const data = await getUserByIdApi(id)
    return data
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch user" }
  }
}

// ✅ Update user profile
export const updateUserService = async (id, formData) => {
  try {
    const data = await updateUserApi(id, formData)
    return data
  } catch (err) {
    throw err.response?.data || { message: "Failed to update user" }
  }
}