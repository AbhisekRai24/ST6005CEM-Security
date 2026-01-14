"use client";

import { useFetchOrdersByUser, useDeleteOrder } from "../hooks/useCreateOrder";
import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthProvider";
import { ShoppingBag, Calendar, Package } from "lucide-react";
import MyOrderCard from "../components/MyOrderCard";
import DeleteModal from "../components/DeleteModal";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Helper: Group orders by formatted date
const groupOrdersByDate = (orders) => {
  const grouped = {};
  orders.forEach((order) => {
    const dateKey = new Date(order.date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(order);
  });
  return grouped;
};

export default function MyOrders() {
  const { user } = useContext(AuthContext);
  const userId = user?._id;

  const { data: orders = [], isLoading, isError } = useFetchOrdersByUser(userId);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const deleteOrderMutation = useDeleteOrder();

  const openDeleteModal = (orderId) => {
    setOrderToDelete(orderId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const confirmDelete = () => {
    if (!orderToDelete) return;

    deleteOrderMutation.mutate(orderToDelete, {
      onSuccess: () => {
        closeDeleteModal();
      },
      onError: () => {
        toast.error("Failed to delete order.");
        closeDeleteModal();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-xl w-64"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="h-96 bg-gray-200 rounded-2xl"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-8">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600">
            We couldn't retrieve your orders. Please try again later.
          </p>
        </div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white rounded-3xl shadow-xl p-16 max-w-lg"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
          <p className="text-gray-600 text-lg mb-8">
            Start exploring our products and place your first order today!
          </p>
          <button className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg">
            Browse Products
          </button>
        </motion.div>
      </div>
    );

  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
            </div>
            <p className="text-gray-600 ml-16">
              Track and manage all your orders in one place
            </p>
          </div>
        </motion.div>

        {/* Orders by Date */}
        <div className="space-y-10">
          {Object.entries(groupedOrders).map(([date, ordersOnDate], sectionIndex) => (
            <motion.section
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              className="space-y-6"
            >
              {/* Date Header */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E5BA41] to-[#D4A830] rounded-lg flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{date}</h2>
                  <p className="text-sm text-gray-500">{ordersOnDate.length} order{ordersOnDate.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Orders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {ordersOnDate.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <MyOrderCard order={order} onDelete={openDeleteModal} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
      />
    </div>
  );
}