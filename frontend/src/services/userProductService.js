import { getAllProductApi, createProductApi, deleteOneProductApi, getProductsByCategoryApi, getProductByIdApi, updateProductApi } from "../../src/api/userProductApi";

export const getAllProductService = async (params) => {
    try {
        const response = await getAllProductApi(params)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Product fetch failed' }
    }
}

export const createProductService = async (data) => {
    try {
        const response = await createProductApi(data)
        return response.data
    } catch (err) {
        throw err.response?.data || { "message": "Failed to create" }
    }

}

export const updateProductService = (id, data) => updateProductApi(id, data);

export const deleteProductService = async (id) => {
    try {
        const response = await deleteOneProductApi(id);
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to delete product" };
    }
};


export const getProductByIdService = async (id) => {
    try {
        const response = await getProductByIdApi(id)
        return response.data.data
    } catch (err) {
        throw err.response?.data || { message: "Failed to fetch product" }
    }
}

export const getProductsByCategoryService = async (categoryId) => {
    const response = await getProductsByCategoryApi(categoryId)

    return response.data.data  // Return the actual product array
}