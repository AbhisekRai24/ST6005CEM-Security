const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// ==========================================
// SPECIFIC ROUTES FIRST (to avoid conflicts)
// ==========================================

// POST /orders - Create new order
router.post("/", orderController.placeOrder);

// GET /orders/all - Get all orders
router.get("/all", orderController.getAllOrders);

// GET /orders/user/:userId - Get orders by user ID
router.get("/user/:userId", orderController.getOrdersByUser);

// PUT /orders/:id/status - Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// PUT /orders/:id/payment - Update payment status
router.put("/:id/payment", orderController.updatePaymentStatus);

// DELETE /orders/:id - Delete order
router.delete("/:id", orderController.deleteOrder);

module.exports = router;