"use client"
import axios from "axios"
import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Plus, Grid3x3 } from "lucide-react"
import { getBackendImageUrl } from '../utils/backend-image'
import { useAdminProduct } from '../hooks/admin/useAdminProduct'
import { useCreateOrder } from "../hooks/useCreateOrder"
import UserSidebar from "./UserCartCheckout"

import { AuthContext } from "../auth/AuthProvider"
import { generateOrderId } from "../utils/order-utils"
import { toast } from "react-toastify"
import PaymentMethodModal from "./payment/PaymentMethodModal"
import ProductDetailsModal from "./ProductDetailsModal"
import DeliveryInfoModal from "./DeliverInfoModal"

export default function UserDashboard() {
  const { user } = useContext(AuthContext)
  const {
    products,
    isLoading,
    isError,
    pageNumber,
    setPageNumber,
    canPreviousPage,
    canNextPage,
    pagination,
  } = useAdminProduct()
  const navigate = useNavigate()

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Modal states
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false)
  const [isDeliveryInfoModalOpen, setIsDeliveryInfoModalOpen] = useState(false)

  // Store selected payment method temporarily
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)

  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) setCart(JSON.parse(storedCart))
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (productWithAddons) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        if (item._id !== productWithAddons._id) return false

        const a1 = item.selectedAddons || []
        const a2 = productWithAddons.selectedAddons || []
        if (a1.length !== a2.length) return false
        for (let i = 0; i < a1.length; i++) {
          if (
            a1[i].name !== a2[i].name ||
            Number(a1[i].price) !== Number(a2[i].price) ||
            Number(a1[i].quantity) !== Number(a2[i].quantity)
          )
            return false
        }
        return true
      })

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += productWithAddons.quantity
        return updated
      }

      return [...prev, productWithAddons]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p._id !== productId))
  }

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: newQty } : item
      )
    )
  }

  const clearCart = () => setCart([])

  const createOrderMutation = useCreateOrder(() => {
    localStorage.removeItem("cart")
    setCart([])
    setIsCartOpen(false)
    navigate("/normal/myorders")
  })

  // Step 1: Proceed to Checkout - Open Payment Method Modal
  const handleCheckout = () => {
    if (cart.length === 0) return
    setIsPaymentMethodModalOpen(true)
  }

  // Step 2: Payment Method Selected - Open Delivery Info Modal
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method)
    setIsPaymentMethodModalOpen(false)
    setIsDeliveryInfoModalOpen(true)
  }

  // Step 3: Delivery Info Submitted - Create Order
  const handleDeliveryInfoSubmit = (deliveryInfo) => {
    setIsDeliveryInfoModalOpen(false)

    const total = cart.reduce((sum, p) => {
      const addonsTotal = (p.selectedAddons || []).reduce(
        (aSum, a) => aSum + a.price * a.quantity,
        0
      );
      return sum + (p.price * p.quantity + addonsTotal);
    }, 0);

    const orderId = generateOrderId();

    // Transform cart items to match your Order schema
    const transformedProducts = cart.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      productImage: item.productImage,
      addons: (item.selectedAddons || []).map(addon => ({
        addonId: addon._id || addon.addonId || `addon_${Date.now()}`,
        name: addon.name,
        price: addon.price,
        quantity: addon.quantity
      }))
    }));

    const order = {
      _id: orderId,
      userId: user._id,
      products: transformedProducts,
      total,
      paymentMethod: selectedPaymentMethod,
      deliveryInfo: deliveryInfo
    };

    console.log("Order payload:", order);

    if (selectedPaymentMethod === "cash") {
      createOrderMutation.mutate(order);
    } else if (selectedPaymentMethod === "online") {
      triggerEsewaPayment(order);
    }
  };

  const triggerEsewaPayment = (order) => {
    axios
      .post("http://localhost:5050/api/esewa/create-payment", {
        amount: order.total,
        pid: order._id
      })
      .then(({ data }) => {
        if (data.url) window.location.href = data.url;
        else toast.error("Failed to get payment URL");
      })
      .catch(() => {
        toast.error("Error initiating eSewa payment");
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex justify-center items-center">
        <p className="text-center text-red-500">Failed to load products.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 py-6">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <Grid3x3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  All Products
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Browse our complete collection
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">View Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white dark:bg-gray-800 min-h-[420px] flex flex-col"
            >
              {/* Image section */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                <img
                  src={getBackendImageUrl(product.productImage)}
                  alt={product.name}
                  className="w-full h-60 object-contain transition-transform duration-500 group-hover:scale-110"
                />

                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Rs {product.price.toLocaleString()}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content section */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
                  {product.description}
                </p>

                {/* Add to cart button */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="mt-auto w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E5BA41] to-amber-500 hover:from-amber-500 hover:to-[#E5BA41] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={!canPreviousPage}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${canPreviousPage
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
          >
            Previous
          </button>

          <span className="text-gray-700 dark:text-gray-200 font-semibold px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPageNumber((prev) => prev + 1)}
            disabled={!canNextPage}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${canNextPage
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Cart Sidebar */}
      <UserSidebar
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        clearCart={clearCart}
        onCheckout={handleCheckout}
      />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
        onSelect={handlePaymentMethodSelect}
      />

      {/* Delivery Info Modal */}
      <DeliveryInfoModal
        isOpen={isDeliveryInfoModalOpen}
        onClose={() => setIsDeliveryInfoModalOpen(false)}
        onSubmit={handleDeliveryInfoSubmit}
        userEmail={user?.email}
        userName={user?.username}
      />
    </div>
  )
}