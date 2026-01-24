// 🔐 TWO-FACTOR AUTHENTICATION ROUTES
// Location: backend/routes/twoFARoutes.js

const express = require("express");
const router = express.Router();
const {
    setup2FA,
    verifyAndEnable2FA,
    verify2FAToken,
    disable2FA,
    get2FAStatus,
    regenerateBackupCodes
} = require("../controllers/twoFAController");

// Import authentication middleware
const { authenticateUser } = require("../middlewares/authorizedUsers");

// Import rate limiter
const { createStrictRateLimiter } = require("../middlewares/rateLimiter");

// Create rate limiter for 2FA operations (stricter limits)
const twoFALimiter = createStrictRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: "Too many 2FA attempts. Please try again later."
});

// ==========================================
// 🔐 2FA ROUTES (All require authentication)
// ==========================================

// Get 2FA status for current user
router.get(
    "/status",
    authenticateUser,
    get2FAStatus
);

// Setup 2FA (Generate QR code)
router.post(
    "/setup",
    authenticateUser,
    twoFALimiter,
    setup2FA
);

// Verify and enable 2FA (After scanning QR code)
router.post(
    "/verify-enable",
    authenticateUser,
    twoFALimiter,
    verifyAndEnable2FA
);

// Verify 2FA token during login (Public - called before full authentication)
// This is used during login flow
router.post(
    "/verify-login",
    twoFALimiter,
    verify2FAToken
);

// Disable 2FA
router.post(
    "/disable",
    authenticateUser,
    twoFALimiter,
    disable2FA
);

// Regenerate backup codes
router.post(
    "/regenerate-backup-codes",
    authenticateUser,
    twoFALimiter,
    regenerateBackupCodes
);

module.exports = router;