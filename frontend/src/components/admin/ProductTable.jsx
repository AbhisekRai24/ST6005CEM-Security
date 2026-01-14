"use client"

import React, { useState } from "react"
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react"
import {
  useAdminProduct,
  useDeleteProduct,
} from "../../hooks/admin/useAdminProduct"
import DeleteModal from "../DeleteModal"
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Skeleton,
} from "@mui/material"

export default function ProductTable() {
  const {
    data,
    error,
    isPending,
    products,
    pageNumber,
    setPageNumber,
    pagination,
    canNextPage,
    canPreviousPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
  } = useAdminProduct()

  const { mutate: deleteProduct, isLoading: isDeleting } = useDeleteProduct()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleDeleteClick = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct._id)
    }
    setShowModal(false)
    setSelectedProduct(null)
  }

  const handlePrev = () => {
    if (canPreviousPage) setPageNumber((prev) => prev - 1)
  }
  const handleNext = () => {
    if (canNextPage) setPageNumber((prev) => prev + 1)
  }
  const handleSearch = (e) => {
    setPageNumber(1)
    setSearch(e.target.value)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Product Management</h1>
              <p className="text-blue-100 text-lg">Manage your inventory</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-right">
            <div>
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-blue-100 text-sm">Total Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{pagination.total || 0}</div>
              <div className="text-blue-100 text-sm">All Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls and Table */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="pageSize" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Show:
            </label>
            <Select
              value={pagination.limit}
              onChange={(e) => setPageSize(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 80, bgcolor: "background.paper", color: "text.primary" }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
            </Select>
            <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
          </div>

          <TextField
            label="Search products"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearch}
            sx={{ maxWidth: 300 }}
            InputProps={{
              startAdornment: <Search className="mr-2 h-4 w-4 text-gray-500" />,
            }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700">
                  Name
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700">
                  Price
                </th>
                <th className="text-right px-6 py-4 font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={120} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={80} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton variant="rectangular" width={100} height={32} />
                    </td>
                  </tr>
                ))
                : products.map((product) => (
                  <tr
                    key={product._id}
                    className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-green-600">
                      Rs. {product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDeleteClick(product)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outlined"
            startIcon={<ChevronLeft />}
            onClick={handlePrev}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <span className="text-gray-700 dark:text-gray-100 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outlined"
            endIcon={<ChevronRight />}
            onClick={handleNext}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"?`}
      />
    </div>
  )
}
