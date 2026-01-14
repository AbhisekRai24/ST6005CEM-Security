import { getAllCategoryApi, createOneCategoryApi, updateOneCategoryApi, deleteOneCategoryApi, getOneCategoryApi } from "../../src/api/userCategoryApi";

export const getAllCategoryService = async () => {
    try {
        const response = await getAllCategoryApi()
        return response.data
    } catch (err) {
        throw err.response?.data || { "message": "Failed to fetch" }
    }
}
export const createOneCategoryService = async (data) => {
    try {
        const response = await createOneCategoryApi(data)
        return response.data
    } catch (err) {
        throw err.response?.data || { "message": "Failed to create" }
    }

}

export const getOneCategoryService = async (id) => {
    try {
        const response = await getOneCategoryApi(id)
        return response.data
    } catch (err) {
        throw err.reponse?.data || { "message": "get failed" }
    }
}

export const updateOneCategoryService = async (id, data) => {
    try {
        const response = await updateOneCategoryApi(id, data)
        return response.data
    } catch (err) {
        throw err.reponse?.data || { "message": "get failed" }
    }
}


export const deleteOneCategoryService = async (id) => {
    try {
        const response = await deleteOneCategoryApi(id)
        return response.data
    } catch (err) {
        throw err.response?.data || { "message": "Delete failed" }
    }
}