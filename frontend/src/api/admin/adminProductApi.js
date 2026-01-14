import axios from "../api"

export const getAllProductApi = (params) => axios.get("/admin/product", { params })

export const getProductByIdApi = (id) => axios.get(`/admin/product/${id}`)

export const createProductApi = (data) => 
    axios.post("/admin/product", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
export const deleteOneProductApi = (id) => {
    return axios.delete(`/admin/product/${id}`);
};
export const getProductsByCategoryApi = (categoryId) =>
  axios.get(`/admin/product/category/${categoryId}`)

export const updateProductApi = (id, data) =>
  axios.put(`/admin/product/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

