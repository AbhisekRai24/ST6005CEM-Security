const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");

// Create checkout session
router.post("/create-checkout-session", stripeController.createCheckoutSession);

// Stripe webhook (for payment confirmation)
router.post("/webhook", express.raw({ type: "application/json" }), stripeController.handleWebhook);

// Verify payment status
router.get("/verify-payment/:sessionId", stripeController.verifyPayment);

module.exports = router;