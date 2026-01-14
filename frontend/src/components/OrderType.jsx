import { FaUtensils, FaShoppingBag } from "react-icons/fa";
import React from "react";

export default function OrderTypeModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-type-title"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl p-12 w-full max-w-3xl h-[60vh] shadow-3xl flex flex-col justify-center items-center space-y-12 animate-fade-in"
        tabIndex={-1}
      >
        <h2
          id="order-type-title"
          className="text-4xl font-extrabold text-gray-900 dark:text-gray-100"
        >
          Select Order Type
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-xl">
          Please choose how you want to receive your order
        </p>

        <div className="flex justify-center gap-12 w-full">
          <button
            onClick={() => onSelect("dine-in")}
            className="flex flex-col items-center justify-center gap-4 bg-blue-700 hover:bg-blue-800 focus:ring-6 focus:ring-blue-500 focus:outline-none text-white font-bold rounded-xl px-12 py-8 w-full max-w-[200px] transition"
            aria-label="Select Dine-In order type"
          >
            <FaUtensils className="text-6xl" />
            <span className="text-2xl">Dine-In</span>
          </button>

          <button
            onClick={() => onSelect("takeaway")}
            className="flex flex-col items-center justify-center gap-4 bg-green-700 hover:bg-green-800 focus:ring-6 focus:ring-green-500 focus:outline-none text-white font-bold rounded-xl px-12 py-8 w-full max-w-[200px] transition"
            aria-label="Select Takeaway order type"
          >
            <FaShoppingBag className="text-6xl" />
            <span className="text-2xl">Takeaway</span>
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
