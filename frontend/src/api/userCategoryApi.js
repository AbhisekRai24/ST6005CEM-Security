import axios from "../api"

export const getAllCategoryApi = () => axios.get("/user/category")

export const createOneCategoryApi = (data) =>
    axios.post("/user/category", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
    ) // request using multer/file upload\

export const getOneCategoryApi = (id) =>
    axios.get("/user/category/" + id)


export const updateOneCategoryApi = (id, data) =>
    axios.put("/user/category/" + id, data, {
        headers: {
            "Content-Type": "multipart/from-data"
        }
    })

export const deleteOneCategoryApi = (id) => {
    return axios.delete(`/user/category/${id}`);
};

