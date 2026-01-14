"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

import { useAdminProduct } from "../hooks/admin/useAdminProduct";
import { getBackendImageUrl } from "../utils/backend-image";
import { ChevronRight, Sparkles, TrendingUp, ShoppingBag, Star, Package } from "lucide-react";
import Slider from "react-slick";

import BannerSlider from "../components/admin/product/BannerSlider";
import CategoryGrid from "../components/admin/product/CategoryGrid";

export default function UserHomePage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { products } = useAdminProduct();

  const featured = Array.isArray(products)
    ? [...products.slice(0, 8)].reverse()
    : [];

  const tickerSettings = {
    dots: false,
    infinite: true,
    speed: 8000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: false,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const navigateWithAuth = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="dark:bg-gray-900 bg-gradient-to-b from-gray-50 to-gray-100 text-black dark:text-white min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Quote Section */}
        <div className="mb-12 py-10 bg-gradient-to-r from-blue-600 to-[#0B2146] text-white rounded-2xl shadow-xl flex items-center justify-center text-center">
          <div>
            <p className="text-3xl font-semibold mb-4">
              "The journey is better with the right gear."
            </p>
            <p className="text-lg">- RevModz Team</p>
          </div>
        </div>

        {/* Banner Slider with Enhanced Styling */}
        <div className="mb-12">
          <BannerSlider />
        </div>

        {/* Welcome Section with Stats */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">{products?.length || 0}+</h3>
                <p className="text-blue-100 text-sm">Products Available</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Star className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">Premium</h3>
                <p className="text-purple-100 text-sm">Quality Guaranteed</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">24/7</h3>
                <p className="text-amber-100 text-sm">Shop Anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#E5BA41] to-amber-500 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Featured Products
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Handpicked just for you</p>
              </div>
            </div>
            <button
              onClick={() => navigateWithAuth("/normal/dash")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              View All
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Product Slider */}
          {featured.length > 0 ? (
            <Slider {...tickerSettings} className="ltr-flip">
              {featured.map((product) => (
                <div key={product._id} className="px-2">
                  <div
                    onClick={() =>
                      navigateWithAuth(`/normal/user/category/${product.categoryId}`)
                    }
                    className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-800 min-h-[380px] flex flex-col"
                  >
                    {/* Image section with gradient overlay */}
                    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center h-52 overflow-hidden">
                      <img
                        src={getBackendImageUrl(product.productImage)}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#E5BA41] to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content section */}
                    <div className="p-5 flex-1 flex flex-col bg-white dark:bg-gray-800">
                      {/* Category badge */}
                      {product.categoryName && (
                        <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-3 w-fit">
                          {product.categoryName}
                        </span>
                      )}

                      <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                        {product.description}
                      </p>

                      {/* Price with styling */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-[#E5BA41] to-amber-600 bg-clip-text text-transparent">
                            Rs {product.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No products available right now.</p>
            </div>
          )}
        </div>

        {/* Shop by Category Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Shop by Category
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find parts for your bike</p>
              </div>
            </div>
          </div>

          <CategoryGrid navigateWithAuth={navigateWithAuth} />
        </div>

        {/* Call-to-Action Banner */}
        <div className="mb-12 bg-gradient-to-r from-blue-600 via-purple-600 to-[#0B2146] rounded-2xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Amazing Deals Today!
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Browse through our extensive collection and find exactly what you're looking for.
            </p>
            <button
              onClick={() => navigateWithAuth("/normal/dash")}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 w-fit"
            >
              Explore All Products
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}