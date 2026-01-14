"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function CreateBannerPage() {
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [banners, setBanners] = useState([]);
    const [loadingBanners, setLoadingBanners] = useState(true);
    const [bannerError, setBannerError] = useState("");

    const API_URL = "http://localhost:5050";

    const fetchBanners = async () => {
        setLoadingBanners(true);
        setBannerError("");
        try {
            const res = await fetch(`${API_URL}/api/admin/banner`);
            if (!res.ok) {
                throw new Error(`Failed to load banners: ${res.status}`);
            }
            const json = await res.json();
            setBanners(json.data || []);
        } catch (err) {
            setBannerError(err.message || "Failed to load banners");
        } finally {
            setLoadingBanners(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Banner name is required");
            return;
        }
        if (!imageFile) {
            setError("Banner image is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("image", imageFile);

            const res = await fetch(`${API_URL}/api/admin/banner`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to create banner");
            }

            toast.success("Banner created successfully!");
            setName("");
            setImageFile(null);
            e.target.reset();

            fetchBanners();
        } catch (err) {
            setError(err.message);
            toast.error(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/banner/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to delete banner");
            }

            toast.success("Banner deleted successfully!");
            fetchBanners();
        } catch (err) {
            toast.error(`Error deleting banner: ${err.message}`);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow-md dark:bg-gray-800 dark:text-white">
            {/* Toast container */}
            <Toaster position="top-right" />

            <h1 className="text-2xl font-bold mb-4">Create New Banner</h1>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="space-y-4 mb-10"
            >
                <div>
                    <label htmlFor="name" className="block font-semibold mb-1">
                        Banner Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter banner name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="image" className="block font-semibold mb-1">
                        Banner Image
                    </label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="w-full"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Uploading..." : "Create Banner"}
                </button>
            </form>

            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
                Existing Banners
            </h2>

            {loadingBanners ? (
                <p className="text-center py-10">Loading banners...</p>
            ) : bannerError ? (
                <p className="text-center py-10 text-red-600">{bannerError}</p>
            ) : banners.length === 0 ? (
                <p className="text-center py-10 text-gray-600 dark:text-gray-400">
                    No banners found.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {banners.map((banner) => (
                        <div
                            key={banner._id}
                            className="relative h-48 rounded overflow-hidden shadow-md dark:bg-gray-700"
                        >
                            <img
                                src={`${API_URL}/${banner.imageUrl.replace(/\\/g, "/")}`}
                                alt={banner.name}
                                className="w-full h-full object-cover opacity-90"
                            />
                            <button
                                onClick={() => handleDelete(banner._id)}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1 rounded opacity-90"
                                title="Delete Banner"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
