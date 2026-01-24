import axios from "./api"; // your configured axios instance

// Fetch all orders (admin/user view)
// export const getAllOrdersApi = () => axios.get("/orders");
export const getAllOrdersApi = () => axios.get("/orders/all");

// Fetch orders by a specific user
export const getOrdersByUserApi = (userId) =>
  // axios.get(`/orders/${userId}`);
  axios.get(`/orders/user/${userId}`);

// Create a new order (called on checkout)
export const createOrderApi = (data) =>
  axios.post("/orders", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
// ✅ Update order status
export const updateOrderStatusApi = (orderId, status) =>
  axios.put(`/orders/${orderId}/status`, { status });


// Delete an order by ID
export const deleteOrderApi = (orderId) => axios.delete(`/orders/${orderId}`);
