const express = require("express");
const router = express.Router();
const esewaController = require("../controllers/esewaController");

// Create mock payment
router.post("/create-payment", esewaController.createEsewaPayment);

// Verify mock payment
router.post("/verify-payment", esewaController.verifyMockPayment);

module.exports = router;