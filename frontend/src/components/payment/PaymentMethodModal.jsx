










import React from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

export default function PaymentMethodModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-method-title"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl p-12 w-full max-w-3xl h-[60vh] shadow-3xl text-center space-y-12 animate-fade-in flex flex-col justify-center"
        tabIndex={-1}
      >
        <h2
          id="payment-method-title"
          className="text-4xl font-extrabold text-gray-900 dark:text-gray-100"
        >
          Select Payment Method
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Choose how you want to pay
        </p>

        <div className="flex justify-center gap-12 w-full">
          <button
            onClick={() => onSelect("cash")}
            className="flex flex-col items-center justify-center gap-4 bg-yellow-500 hover:bg-yellow-600 focus:ring-6 focus:ring-yellow-400 focus:outline-none text-white font-bold rounded-xl px-12 py-8 w-full max-w-[200px] transition"
            aria-label="Select cash payment method"
          >
            <FaMoneyBillWave className="text-6xl" />
            <span className="text-2xl">Cash</span>
          </button>

          <button
            onClick={() => onSelect("online")}
            className="flex flex-col items-center justify-center gap-4 bg-purple-700 hover:bg-purple-800 focus:ring-6 focus:ring-purple-500 focus:outline-none text-white font-bold rounded-xl px-12 py-8 w-full max-w-[200px] transition"
            aria-label="Select online payment method"
          >
            <FaCreditCard className="text-6xl" />
            <span className="text-2xl">Online (eSewa)</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-auto text-red-600 dark:text-red-500 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded text-lg font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}





