"use client"

import React, { useState } from "react"
import { useAdminCategory, useDeleteOneCategory } from "../../hooks/admin/useAdminCategory"
import { getBackendImageUrl } from "../../utils/backend-image"
import { Link } from "react-router-dom"
import DeleteModal from "../DeleteModal"
import { ImageIcon, Eye, Edit3, Trash2, Plus } from "lucide-react"

export default function CategoryTable() {
  const { categories, error, isPending } = useAdminCategory()
  const deleteCategoryHook = useDeleteOneCategory()
  const [deleteId, setDeleteId] = useState(null)
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set())

  const handleDelete = () => {
    deleteCategoryHook.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    })
  }

  const handleImageError = (categoryId) => {
    setImageLoadErrors((prev) => new Set([...prev, categoryId]))
  }

  const gradientBorders = [
    "bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800",
    "bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800",
    "bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800",
    "bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800",
    "bg-gradient-to-br from-rose-400 to-rose-600 dark:from-rose-600 dark:to-rose-800",
    "bg-gradient-to-br from-cyan-400 to-cyan-600 dark:from-cyan-600 dark:to-cyan-800",
  ]

  // Loading skeleton component
  const CategorySkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 animate-pulse">
      <div className="p-4">
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mx-auto"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-10 rounded-xl shadow-md">
      <DeleteModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirmation"
        description="Click Confirm To Delete This Item."
      />

      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Categories</h2>
        <Link to="/admin/category/create">
          <button className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            Add Category
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-200"></div>
          </button>
        </Link>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
        </div>
      )}

      {!isPending && categories?.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No categories found</h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">Get started by creating your first category</p>
          <Link to="/admin/category/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200">
              Create Category
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!isPending &&
          categories?.map((cat, index) => (
            <div
              key={cat._id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl border-2 overflow-hidden transform hover:scale-105 transition-all duration-300 p-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient border */}
              <div
                className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradientBorders[index % gradientBorders.length]}`}
              />

              <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 h-full flex flex-col">
                {/* Image container */}
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                  {imageLoadErrors.has(cat._id) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={getBackendImageUrl(cat.filepath) || "/placeholder.svg"}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => handleImageError(cat._id)}
                      loading="lazy"
                    />
                  )}

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                    <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Link to={`/admin/category/${cat._id}`}>
                        <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-110">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link to={`/admin/category/${cat._id}/edit`}>
                        <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-110">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteId(cat._id)}
                        className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-600/80 transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category name */}
                <div className="flex-1 flex items-center justify-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
