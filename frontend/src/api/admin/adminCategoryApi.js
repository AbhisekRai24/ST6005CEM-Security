import axios from "../api"

export const getAllCategoryApi = () => axios.get("/admin/category")

export const createOneCategoryApi = (data) =>
    axios.post("/admin/category", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
    ) // request using multer/file upload\

export const getOneCategoryApi = (id) =>
    axios.get("/admin/category/" + id)


export const updateOneCategoryApi = (id, data) =>
    axios.put("/admin/category/" + id, data, {
        headers: {
            "Content-Type": "multipart/from-data"
        }
    })

export const deleteOneCategoryApi = (id) => {
    return axios.delete(`/admin/category/${id}`);
};

