import React from 'react';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { useGetOneCategory, useUpdateOneCategory } from '../../hooks/admin/useAdminCategory';
import { useParams } from 'react-router-dom';
import { getBackendImageUrl } from '../../utils/backend-image';

export default function UpdateCategory() {
    const { id } = useParams();
    const updateCategory = useUpdateOneCategory();
    const categoryOne = useGetOneCategory(id);

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required"),
        image: Yup.mixed().nullable().test(
            "fileSize",
            "File too large (Max 5MB)",
            (value) => !value || (value && value.size <= 5 * 1024 * 1024)
        )
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: categoryOne.category?.name || "",
            image: ""
        },
        validationSchema,
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.image) {
                formData.append("image", values.image);
            }

            updateCategory.mutate(
                { id, data: formData },
                {
                    onSuccess: () => formik.resetForm()
                }
            );
        }
    });

    return (
        <div className="max-w-xl mx-auto p-6 mt-10 bg-white shadow-md rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-black text-center">Update Category</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Category Name</label>
                    <input
                        name="name"
                        onChange={formik.handleChange}
                        value={formik.values.name}
                        className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#A62123]"
                    />
                    {formik.touched.name && formik.errors.name && (
                        <p className="text-sm text-red-600 mt-1">{formik.errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-1">Category Image</label>
                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.currentTarget.files[0];
                            if (file) formik.setFieldValue("image", file);
                        }}
                        className="w-full border rounded-lg p-2"
                    />
                    {formik.touched.image && formik.errors.image && (
                        <p className="text-sm text-red-600 mt-1">{formik.errors.image}</p>
                    )}
                </div>

                <div className="flex justify-center">
                    {formik.values.image ? (
                        <img
                            className="w-32 h-32 object-cover rounded-lg"
                            src={URL.createObjectURL(formik.values.image)}
                            alt="preview"
                        />
                    ) : (
                        <img
                            className="w-32 h-32 object-cover rounded-lg"
                            src={getBackendImageUrl(categoryOne.category?.filepath)}
                            alt={categoryOne.category?.name}
                        />
                    )}
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        className="bg-[#A62123] text-white font-medium py-2 px-40 rounded-lg border border-[#A62123] transition-all duration-300 hover:bg-white hover:text-[#A62123]"
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
}
