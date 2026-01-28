const Order = require("../models/Order");
const Notification = require("../models/Notification");

exports.placeOrder = async (req, res) => {
  try {
    const { userId, products, total, paymentMethod, deliveryInfo } = req.body;

    // Validate products
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    // Validate product data
    for (const p of products) {
      if (!p._id || !p.quantity || !p.price) {
        return res.status(400).json({ message: "Invalid product data" });
      }
      if (p.addons) {
        for (const a of p.addons) {
          if (!a.addonId || !a.price || !a.quantity) {
            return res.status(400).json({ message: "Invalid addon data" });
          }
        }
      }
    }

    // Validate payment method
    if (!paymentMethod || !["cash", "online"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Valid payment method is required (cash or online)" });
    }

    // Validate delivery info
    if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.email ||
      !deliveryInfo.phone || !deliveryInfo.address) {
      return res.status(400).json({
        message: "Complete delivery information is required (name, email, phone, address)"
      });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(deliveryInfo.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(deliveryInfo.phone.replace(/[-\s]/g, ''))) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    const newOrder = new Order({
      userId,
      products,
      total,
      paymentMethod,
      deliveryInfo,
      status: "pending",
      paymentStatus: paymentMethod === "cash" ? "pending" : "pending"
    });

    const savedOrder = await newOrder.save();

    // Create notification for new order
    const notification = await Notification.create({
      userId: userId,
      message: `Your order #${savedOrder._id} has been placed successfully!`,
    });

    // Emit real-time notification
    if (global.io) {
      global.io.to(userId.toString()).emit("orderPlaced", notification);
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "username email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // ADD THESE 5 LINES:
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const orders = await Order.find({ userId }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's orders", error });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { status } = req.body;
    const validStatuses = ["pending", "completed", "processing"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    order.status = status;
    await order.save();

    // Create notification message
    const message = `Your order #${order._id} status changed to ${status}`;

    // Save notification to DB
    const notification = await Notification.create({
      userId: order.userId,
      message,
    });

    // Emit real-time event using global.io
    if (global.io) {
      global.io.to(order.userId.toString()).emit("orderStatusUpdated", notification);
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const { paymentStatus } = req.body;
    const validStatuses = ["pending", "paid", "failed"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status value" });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    // Create notification for payment update
    const message = `Payment status for order #${order._id} is now ${paymentStatus}`;
    const notification = await Notification.create({
      userId: order.userId,
      message,
    });

    // Emit real-time event
    if (global.io) {
      global.io.to(order.userId.toString()).emit("paymentStatusUpdated", notification);
    }

    res.json({ message: "Payment status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};