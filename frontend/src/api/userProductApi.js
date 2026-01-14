import axios from "../api"

export const getAllProductApi = (params) => axios.get("/user/product", { params })

export const getProductByIdApi = (id) => axios.get(`/user/product/${id}`)

export const createProductApi = (data) => 
    axios.post("/user/product", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
export const deleteOneProductApi = (id) => {
    return axios.delete(`/user/product/${id}`);
};
export const getProductsByCategoryApi = (categoryId) =>
  axios.get(`/user/product/category/${categoryId}`)

export const updateProductApi = (id, data) =>
  axios.put(`/user/product/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

