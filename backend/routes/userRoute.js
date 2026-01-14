const express = require("express");
const router = express.Router();
const upload = require("../middlewares/fileupload");
const {
  registerUser,
  loginUser,
  getUser,
  updateUser,
  resetPassword,
  sendResetLink,
  changePassword,
  logoutUser, // 🔒 NEW

} = require("../controllers/userController");

// 🔒 Import authentication and security middlewares
const { authenticateUser } = require("../middlewares/authorizedUsers");
const checkPasswordExpiry = require("../middlewares/checkPasswordExpiry");

// 🔒 Import rate limiters
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  createAccountLoginLimiter
} = require("../middlewares/rateLimiter");

// 🔒 Import security logger
const { detectSuspiciousActivity } = require("../middlewares/securityLogger");

// Initialize account-based login limiter
const accountLoginLimiter = createAccountLoginLimiter();

// ========== PUBLIC ROUTES WITH RATE LIMITING ==========

// 🔒 REGISTER - Rate limited (5 per hour per IP)
router.post(
  "/register",
  registerLimiter,
  detectSuspiciousActivity, // Check for malicious input
  upload.single("profileImage"),
  registerUser
);

// 🔒 LOGIN - Double rate limiting (IP + Account based)
router.post(
  "/login",
  loginLimiter,           // IP-based: 10 attempts per 15 min
  accountLoginLimiter,    // Account-based: 5 attempts per 15 min
  detectSuspiciousActivity, // Check for malicious input
  loginUser
);

//logout
router.post("/logout", logoutUser);

router.post(
  "/request-reset",
  passwordResetLimiter,
  detectSuspiciousActivity,
  sendResetLink
);

router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  detectSuspiciousActivity,
  resetPassword
);

// ========== PROTECTED ROUTES (Authentication Required) ==========
// ✅ NEW: Get current authenticated user (any role)
router.get(
  "/me",
  authenticateUser,  // Only needs to be logged in
  (req, res) => {
    try {
      // req.user is set by authenticateUser middleware
      res.json({
        success: true,
        data: req.user
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to get user"
      });
    }
  }
);

// 🔒 Get user - with password expiry check
router.get(
  "/:id",
  authenticateUser,
  checkPasswordExpiry,
  getUser
);

// 🔒 Update user - with password expiry check
router.put(
  "/:id",
  authenticateUser,
  checkPasswordExpiry,
  upload.single("profileImage"),
  updateUser
);

// 🔒 Change password - No rate limit (user is authenticated)
router.put(
  "/:id/change-password",
  authenticateUser,
  detectSuspiciousActivity,
  changePassword
);

module.exports = router;