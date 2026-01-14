import { useState, useEffect } from "react"
import { X, Plus, Minus, ShoppingCart, Package } from "lucide-react"
import { getBackendImageUrl } from '../utils/backend-image'

export default function ProductDetailsModal({ product, onClose, onAddToCart }) {
    const [quantity, setQuantity] = useState(1)
    const [addons, setAddons] = useState([])
    const imageUrl = getBackendImageUrl(product.productImage);

    useEffect(() => {
        setAddons(
            (product.addons || []).map((addon) => ({
                addonId: addon._id,
                name: addon.name,
                price: addon.price,
                selected: false,
                quantity: 1,
            }))
        );
        setQuantity(1);
    }, [product])

    const toggleAddon = (index) => {
        setAddons((prev) =>
            prev.map((addon, i) => {
                if (i !== index) return addon
                const selected = !addon.selected
                return {
                    ...addon,
                    selected,
                    quantity: selected ? addon.quantity : 1,
                }
            })
        )
    }

    const changeAddonQty = (index, val) => {
        const v = Math.max(1, Number(val) || 1)
        setAddons((prev) =>
            prev.map((addon, i) =>
                i === index ? { ...addon, quantity: v } : addon
            )
        )
    }

    const baseTotal = product.price * quantity
    const addonsTotal = addons.reduce(
        (sum, a) => (a.selected ? sum + a.price * a.quantity : sum),
        0
    )
    const total = baseTotal + addonsTotal

    const handleAdd = () => {
        const selectedAddons = addons
            .filter((a) => a.selected)
            .map(({ addonId, name, price, quantity }) => ({
                addonId,
                name,
                price,
                quantity
            }));

        const { addons: _, ...cleanProduct } = product;

        const productToAdd = {
            ...cleanProduct,
            quantity,
            ...(selectedAddons.length > 0 && { addons: selectedAddons })
        };

        onAddToCart(productToAdd);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    onClick={onClose}
                    aria-label="Close product details"
                >
                    <X size={20} />
                </button>

                {/* Left side - Image container */}
                <div className="flex-shrink-0 w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-8">
                    <div className="relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-4"
                            loading="lazy"
                        />
                        {/* Category badge if available */}
                        {product.categoryName && (
                            <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                                {product.categoryName}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Content & controls */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {/* Product Header */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                            {product.name}
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-3 py-1 bg-gradient-to-r from-[#E5BA41] to-amber-500 text-white text-sm font-bold rounded-full">
                                Rs {product.price.toLocaleString()}
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {product.description || "No description available."}
                        </p>
                    </div>

                    {/* Quantity control */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <label className="block font-semibold text-gray-900 dark:text-white text-sm mb-3">
                            Quantity
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus size={16} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-2"
                            />
                            <button
                                className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-105"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus size={16} className="text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>

                    {/* Add-ons */}
                    {addons.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                    Available Add-ons
                                </h3>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {addons.map((addon, idx) => (
                                    <div
                                        key={idx}
                                        className={`
                                            p-4 rounded-xl border transition-all duration-300
                                            ${addon.selected
                                                ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={addon.selected}
                                                id={`addon-${idx}`}
                                                onChange={() => toggleAddon(idx)}
                                                className="mt-1 w-5 h-5 rounded cursor-pointer accent-blue-600"
                                            />
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`addon-${idx}`}
                                                    className="cursor-pointer text-gray-900 dark:text-white font-medium block mb-1"
                                                >
                                                    {addon.name}
                                                </label>
                                                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                                    + Rs {addon.price.toLocaleString()}
                                                </span>
                                            </div>
                                            {addon.selected && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => changeAddonQty(idx, addon.quantity - 1)}
                                                        disabled={addon.quantity <= 1}
                                                        className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold text-sm">
                                                        {addon.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => changeAddonQty(idx, addon.quantity + 1)}
                                                        className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total & Add to cart */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Rs {total.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleAdd}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E5BA41] to-amber-500 hover:from-amber-500 hover:to-[#E5BA41] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}