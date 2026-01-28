import React from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import { X } from "lucide-react";

export default function PaymentMethodModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative animate-fade-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Select Payment Method
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you want to complete your purchase
            </p>
          </div>

          {/* Payment Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <button
              onClick={() => onSelect("cash")}
              className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:ring-4 focus:ring-yellow-400 focus:outline-none text-white font-bold rounded-xl p-8 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              aria-label="Select cash payment method"
            >
              <FaMoneyBillWave className="text-6xl" />
              <span className="text-2xl">Cash</span>
              <span className="text-sm opacity-90">Pay on delivery</span>
            </button>

            <button
              onClick={() => onSelect("online")}
              className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-4 focus:ring-purple-500 focus:outline-none text-white font-bold rounded-xl p-8 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              aria-label="Select online payment method"
            >
              <FaCreditCard className="text-6xl" />
              <span className="text-2xl">Online</span>
              <span className="text-sm opacity-90">Pay with Stripe</span>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 rounded text-base font-semibold py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}