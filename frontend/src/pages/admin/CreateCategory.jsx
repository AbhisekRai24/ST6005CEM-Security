import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateCategory } from '../../hooks/admin/useAdminCategory';

export default function CreateCategory() {
    const { mutate, data, error, isPending } = useCreateCategory();

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        image: Yup.mixed()
            .nullable()
            .test('fileSize', 'File too large', (value) => !value || (value && value.size <= 5 * 1024 * 1024)),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            image: '',
        },
        validationSchema,
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append('name', values.name);
            if (values.image) formData.append('image', values.image);
            mutate(formData, {
                onSuccess: () => {
                    formik.resetForm();
                },
            });
        },
    });

    return (
        <div className="max-w-4xl mx-auto mt-12 p-10 bg-white rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Category</h2>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category Name</label>
                    <input
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.name}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="Enter category name"
                    />
                    {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category Image</label>
                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.currentTarget.files[0];
                            if (file) formik.setFieldValue('image', file);
                        }}
                        className="w-full border border-gray-300 p-2 rounded-lg"
                    />
                    {formik.touched.image && formik.errors.image && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.image}</p>
                    )}
                </div>

                {formik.values.image && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-700 font-semibold mb-3">Image Preview:</p>
                        <div className="inline-block border border-gray-300 shadow-md rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105">
                            <img
                                src={URL.createObjectURL(formik.values.image)}
                                alt="preview"
                                className="w-64 h-64 object-cover"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{formik.values.image.name}</p>
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gray-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                    {isPending ? 'Creating...' : 'Create Category'}
                </button>

                {error && <p className="text-red-500 text-sm text-center mt-2">{error.message}</p>}
                {data && <p className="text-green-600 text-sm text-center mt-2">Category created successfully!</p>}
            </form>
        </div>
    );
}
