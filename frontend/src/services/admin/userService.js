import {createUserApi, getAllUserApi, deleteUserApi, updateUserApi , getUserByIdApi } from "../../api/admin/userApi";


export const createUserService = async (formData) => {
    try {
        const response = await createUserApi(formData);
        return response;
    } catch (err) {
        throw err?.response?.data || { message: "Failed to create user" };
    }
};


export const getAllUserService = async () => {
    try {
        const response = await getAllUserApi()
        return response.data
    } catch (err) {
        throw err.response?.data || { "message": "Failed to fetch" }
    }
}


export const getUserByIdService = async (id) => {
  try {
    const response = await getUserByIdApi(id);
    if (response.succes) {
      return response.data; // <-- return only user data here
    } else {
      throw new Error(response.message || "Failed to fetch user");
    }
  } catch (err) {
    throw err?.response?.data || { message: err.message || "Failed to fetch user" };
  }
};


export const updateUserService = async ({ id, data }) => {
    try {
        const response = await updateUserApi({ id, data });
        return response;
    } catch (error) {
        throw error?.response?.data || { message: "Failed to update user" };
    }
};

export const deleteUserService = async (id) => {
  try {
    const response = await deleteUserApi(id);
    return response.data;  // { success: true, message: "User Deleted" }
  } catch (error) {
    // Extract a useful error message
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to delete user");
  }
};
