const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// POST /orders
router.post("/", orderController.placeOrder);

// GET /orders
router.get("/", orderController.getAllOrders);

// GET /orders/:userId
router.get("/:userId", orderController.getOrdersByUser);

router.put("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);


module.exports = router;
