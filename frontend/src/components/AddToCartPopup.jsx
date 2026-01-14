"use client"

import { useEffect } from "react"
import { Plus, Minus, X } from "lucide-react"

export default function AddToCartPopup({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onClose,
  duration = 3000 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  if (!product) return null

  return (
    <div
      className="fixed bottom-6 right-6 w-80 bg-[#222740] rounded-lg shadow-xl border border-blue-700 p-5 flex items-center gap-5 z-[9999] text-white"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      {/* Product info */}
      <div className="flex-1">
        <h4 className="font-semibold text-lg">{product.name}</h4>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onDecrement}
            disabled={quantity <= 1}
            className="p-2 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition"
            aria-label="Decrease quantity"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="px-3 text-lg font-semibold">{quantity}</span>
          <button
            onClick={onIncrement}
            className="p-2 rounded bg-blue-700 hover:bg-blue-600 transition"
            aria-label="Increase quantity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close popup"
        className="text-blue-300 hover:text-white transition"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  )
}
