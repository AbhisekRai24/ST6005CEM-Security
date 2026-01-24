const Order = require("../models/Order");

// Mock eSewa Configuration (for demo/college project)
const ESEWA_CONFIG = {
  merchantId: "DEMO_MERCHANT",
  successUrl: "http://localhost:5173/payment/success",
  failureUrl: "http://localhost:5173/payment/failure",
};

// Create mock eSewa payment (simulated)
exports.createEsewaPayment = async (req, res) => {
  try {
    const { amount, pid } = req.body;

    if (!amount || !pid) {
      return res.status(400).json({ 
        message: "Amount and order ID are required" 
      });
    }

    // Check if order exists
    const order = await Order.findById(pid);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Save the order with pending payment status
    order.paymentStatus = "pending";
    await order.save();

    // Create mock eSewa payment URL (redirects to our own mock payment page)
    const mockPaymentUrl = `http://localhost:5173/payment/mock-esewa?orderId=${pid}&amount=${amount}`;
    
    res.json({ 
      success: true,
      url: mockPaymentUrl,
      message: "Mock payment created (for demo purposes)"
    });

  } catch (error) {
    console.error("Mock eSewa payment error:", error);
    res.status(500).json({ 
      message: "Error creating payment",
      error: error.message 
    });
  }
};

// Verify mock payment
exports.verifyMockPayment = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (success === "true" || success === true) {
      // Payment successful
      order.paymentStatus = "paid";
      order.status = "processing";
      await order.save();

      res.json({
        success: true,
        message: "Payment verified successfully (DEMO)",
        order
      });
    } else {
      // Payment failed
      order.paymentStatus = "failed";
      await order.save();

      res.json({
        success: false,
        message: "Payment failed (DEMO)",
        order
      });
    }

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ 
      message: "Error verifying payment",
      error: error.message 
    });
  }
};