"use client"

import { Clock, CheckCircle, RefreshCw, Trash2, Package, Calendar, Tag, ChevronRight } from "lucide-react"
import { getBackendImageUrl } from "../utils/backend-image"

const statusConfig = {
  pending: {
    label: "Pending",
    bgColor: "bg-gradient-to-r from-amber-400 to-orange-400",
    textColor: "text-amber-900",
    badge: "bg-amber-100 border-amber-300",
    icon: <Clock className="w-5 h-5" />,
  },
  processing: {
    label: "Processing",
    bgColor: "bg-gradient-to-r from-blue-400 to-cyan-400",
    textColor: "text-blue-900",
    badge: "bg-blue-100 border-blue-300",
    icon: <RefreshCw className="w-5 h-5 animate-spin" />,
  },
  completed: {
    label: "Completed",
    bgColor: "bg-gradient-to-r from-emerald-400 to-green-400",
    textColor: "text-emerald-900",
    badge: "bg-emerald-100 border-emerald-300",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  default: {
    label: "Unknown",
    bgColor: "bg-gradient-to-r from-gray-400 to-gray-500",
    textColor: "text-gray-900",
    badge: "bg-gray-100 border-gray-300",
    icon: <Package className="w-5 h-5" />,
  },
}

function formatCurrency(amount) {
  return amount.toLocaleString("en-IN")
}

function calculateGrandTotal(products) {
  return products.reduce((total, item) => {
    const addonsTotal = item.addons
      ? item.addons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
      : 0
    return total + item.price * item.quantity + addonsTotal
  }, 0)
}

export default function MyOrderCard({ order, onDelete }) {
  const status = statusConfig[order.status] || statusConfig.default
  const grandTotal = calculateGrandTotal(order.products || [])

  return (
    <article
      aria-label={`Order ${order._id}`}
      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Status Banner */}
      <div className={`${status.bgColor} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/90 p-2 rounded-full shadow-md">
            {status.icon}
          </div>
          <div>
            <p className={`text-sm font-medium ${status.textColor}`}>Order Status</p>
            <p className="text-white font-bold text-lg">{status.label}</p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
          <p className="text-white font-mono font-bold text-sm">
            #{order._id.slice(-4).toUpperCase()}          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Order Info Bar */}
        <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {new Date(order.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-blue-700">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">{order.products?.length || 0} Items</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            Order Items
          </h4>

          <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
            {order.products?.map((item) => {
              const imgSrc = item.productImage?.startsWith("http")
                ? item.productImage
                : getBackendImageUrl(item.productImage)

              const itemTotal = item.price * item.quantity
              const addonsTotal = item.addons
                ? item.addons.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
                : 0

              return (
                <div
                  key={item._id}
                  className="relative bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      {item.productImage ? (
                        <div className="relative">
                          <img
                            src={imgSrc || "/placeholder.svg"}
                            alt={item.name}
                            loading="lazy"
                            className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                          />
                          <div className="absolute -top-2 -right-2 bg-blue-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            ×{item.quantity}
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h5 className="font-bold text-gray-900 text-lg group-hover:text-blue-400 transition-colors">
                          {item.name}
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          Rs {formatCurrency(item.price)} per unit
                        </p>
                      </div>

                      {/* Add-ons */}
                      {item.addons && item.addons.length > 0 && (
                        <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFF4D6] border border-[#E5BA41]/30 rounded-lg p-3">
                          <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-[#E5BA41]" />
                            Extra Items
                          </p>
                          <div className="space-y-1">
                            {item.addons.map((addon, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700">
                                  {addon.name} <span className="text-gray-500">× {addon.quantity}</span>
                                </span>
                                <span className="font-bold text-[#E5BA41]">
                                  + Rs {formatCurrency(addon.price * addon.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Item Total */}
                      <div className="flex items-baseline gap-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-xl font-bold text-blue-400">
                          Rs {formatCurrency(itemTotal + addonsTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grand Total Section */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Order Total</p>
              <p className="text-3xl font-bold">Rs {formatCurrency(grandTotal)}</p>
            </div>
            <button
              onClick={() => onDelete(order._id)}
              aria-label="Delete order"
              type="button"
              className="bg-white/20 hover:bg-red-500 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-xl backdrop-blur-sm border border-white/30"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}