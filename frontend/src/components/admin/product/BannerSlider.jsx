"use client";

import { useEffect, useState } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Custom arrow components
function NextArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
            <ChevronRight className="w-6 h-6" />
        </button>
    );
}

function PrevArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white p-3 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
    );
}

const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: true,
    fade: true,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    appendDots: (dots) => (
        <div className="absolute bottom-6">
            <ul className="flex gap-2 justify-center">{dots}</ul>
        </div>
    ),
    customPaging: () => (
        <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-all duration-300 hover:scale-125" />
    ),
};

export default function BannerSlider() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = "http://localhost:5050";

    useEffect(() => {
        async function fetchBanners() {
            try {
                const res = await fetch(`${API_URL}/api/admin/banner`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const json = await res.json();
                setBanners(json.data || []);
            } catch (err) {
                setError(err.message || "Failed to load banners");
            } finally {
                setLoading(false);
            }
        }
        fetchBanners();
    }, [API_URL]);

    if (loading) {
        return (
            <div className="mb-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden">
                <div className="h-96 sm:h-[500px] md:h-[600px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading banners...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-10 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl overflow-hidden border border-red-200 dark:border-red-800">
                <div className="h-96 sm:h-[500px] md:h-[600px] flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-red-600 dark:text-red-400 font-semibold">Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!banners.length) {
        return (
            <div className="mb-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
                <div className="h-96 sm:h-[500px] md:h-[600px] flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No banners available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Admin can add banners from the dashboard</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            <Slider {...bannerSettings}>
                {banners.map((banner) => (
                    <div key={banner._id} className="relative outline-none">
                        <div className="relative h-96 sm:h-[500px] md:h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                            {/* Banner Image with overlay */}
                            <img
                                src={`${API_URL}/${banner.imageUrl.replace(/\\/g, "/")}`}
                                alt={banner.name || "Banner"}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Gradient overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                            {/* Optional: Banner info overlay */}
                            {banner.name && (
                                <div className="absolute bottom-16 left-8 right-8 z-10">
                                    <div className="bg-white/10 dark:bg-gray-900/30 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                                            {banner.name}
                                        </h3>
                                        {banner.description && (
                                            <p className="text-white/90 text-sm sm:text-base">
                                                {banner.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}