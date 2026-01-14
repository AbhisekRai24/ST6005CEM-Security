const Order = require("../models/Order");
const Notification = require("../models/Notification");

exports.placeOrder = async (req, res) => {
  try {
    const { userId, products, total, orderType } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

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

    const newOrder = new Order({
      userId,
      products,
      total,
      orderType,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Error placing order", error });
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
    global.io.to(order.userId.toString()).emit("orderStatusUpdated", notification);

    res.json({ message: "Order status updated", order });
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