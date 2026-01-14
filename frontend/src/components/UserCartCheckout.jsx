"use client"
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react"

import { getBackendImageUrl } from '../utils/backend-image'

export default function UserSidebar({
    cart,
    isOpen,
    onClose,
    removeFromCart,
    updateQuantity,
    clearCart,
    onCheckout
}) {
    // Calculate subtotal including add-ons for each product
    const subtotal = cart.reduce((total, product) => {
        const addonsTotal = (product.addons || []).reduce(
            (sum, a) => sum + a.price * a.quantity * product.quantity,
            0
        );

        return total + product.price * product.quantity + addonsTotal;
    }, 0);

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-blue-400" />
                        <h3 className="text-2xl font-bold text-gray-900">Your Cart</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                            <p className="text-gray-400 text-sm mt-2">Add items to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((product) => (
                                <div
                                    key={product._id}
                                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex gap-4">
                                        <img
                                            src={getBackendImageUrl(product.productImage)}
                                            alt={product.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <button
                                                    onClick={() => updateQuantity(product._id, product.quantity - 1)}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={product.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                                                    {product.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(product._id, product.quantity + 1)}
                                                    className="p-1.5 rounded-lg bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <p className="text-blue-400 font-bold text-lg">
                                                Rs {(
                                                    product.price * product.quantity +
                                                    (product.addons || []).reduce(
                                                        (sum, a) => sum + a.price * a.quantity * product.quantity,
                                                        0
                                                    )
                                                ).toLocaleString()}
                                            </p>

                                            {/* Add-ons */}
                                            {product.addons && product.addons.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {product.addons.map((addon, i) => (
                                                        <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                            {addon.name} x {addon.quantity}
                                                            <span className="text-[#E5BA41] font-medium">
                                                                (+ Rs {(addon.price * addon.quantity).toLocaleString()})
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromCart(product._id)}
                                        className="w-full mt-3 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-gray-200 bg-white space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Subtotal</span>
                            <span className="text-2xl font-bold text-gray-900">
                                Rs {subtotal.toLocaleString()}
                            </span>
                        </div>

                        <button
                            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                            onClick={onCheckout}
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                            onClick={clearCart}
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                />
            )}
        </>
    )
}