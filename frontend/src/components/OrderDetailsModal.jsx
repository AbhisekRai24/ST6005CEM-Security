import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 shadow-sm",
  processing: "bg-blue-100 text-blue-800 shadow-sm",
  completed: "bg-green-100 text-green-800 shadow-sm",
};

function formatCurrency(amount) {
  return amount.toLocaleString("en-IN");
}

export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!order) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-sm"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 backdrop-blur-sm"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div
            className="fixed inset-0 bg-transparent backdrop-filter backdrop-blur-sm dark:backdrop-blur-md"
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="flex items-center justify-center min-h-screen p-6 text-center">
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-90"
          >
            <Dialog.Panel className="inline-block w-full max-w-4xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-2xl dark:shadow-black rounded-lg max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <Dialog.Title className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                  Order #{order._id.slice(-5)}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700 transition"
                  aria-label="Close modal"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* User & Date */}
              <div className="mb-6 space-y-2 text-lg text-gray-800 dark:text-gray-300">
                <p>
                  <strong>User:</strong> {order.userId?.username || "Unknown"}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(order.date).toLocaleString()}
                </p>
                <span
                  className={`inline-block mt-1 px-4 py-2 rounded-full text-base font-semibold ${statusStyles[order.status]
                    }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <hr className="my-6 border-gray-300 dark:border-gray-700" />

              {/* Products list */}
              <div>
                <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-5">
                  Items:
                </h3>
                <ul className="divide-y divide-gray-300 dark:divide-gray-700 max-h-[50vh] overflow-y-auto">
                  {order.products.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-start py-4"
                    >
                      <div className="flex items-start gap-5">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.name}
                            className="w-20 h-20 rounded-md object-cover border border-gray-300 dark:border-gray-600"
                          />
                        )}
                        <div>
                          <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
                            {item.name} x {item.quantity}
                          </div>

                          {/* Show addons if available */}
                          {item.addons && item.addons.length > 0 && (
                            <ul className="ml-6 mt-2 text-base text-gray-700 dark:text-gray-400 list-disc space-y-1">
                              {item.addons.map((addon, i) => (
                                <li key={i} className="ml-2">
                                  {addon.name} - Rs {formatCurrency(addon.price)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg whitespace-nowrap">
                        Rs{" "}
                        {formatCurrency(
                          (item.price +
                            (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0)) *
                          item.quantity
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="my-6 border-gray-300 dark:border-gray-700" />

              {/* Total */}
              <div className="text-right font-bold text-2xl text-gray-900 dark:text-gray-100">
                Total: Rs{" "}
                {formatCurrency(
                  order.products.reduce((total, item) => {
                    const addonsTotal =
                      item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
                    return total + (item.price + addonsTotal) * item.quantity;
                  }, 0)
                )}
              </div>

              {/* Footer Close Button */}
              <div className="mt-10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition text-lg font-semibold dark:text-gray-100"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
