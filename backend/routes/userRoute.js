// 🔐 USER ROUTES WITH 2FA SUPPORT (UPDATED)
// Location: backend/routes/userRoutes.js

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
  logoutUser,
  getCurrentUserProfile
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
  detectSuspiciousActivity,
  upload.single("profileImage"),
  registerUser
);

// 🔒 LOGIN - Double rate limiting (IP + Account based)
router.post(
  "/login",
  loginLimiter,           // IP-based: 10 attempts per 15 min
  accountLoginLimiter,    // Account-based: 5 attempts per 15 min
  detectSuspiciousActivity,
  loginUser
);

// 🔒 LOGOUT
router.post("/logout", logoutUser);

// 🔒 REQUEST PASSWORD RESET
router.post(
  "/request-reset",
  passwordResetLimiter,
  detectSuspiciousActivity,
  sendResetLink
);

// 🔒 RESET PASSWORD
router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  detectSuspiciousActivity,
  resetPassword
);

// ========== PROTECTED ROUTES (Authentication Required) ==========

// ✅ GET CURRENT USER PROFILE (Primary endpoint for user's own profile)
// Use this endpoint in your UserProfile component
router.get(
  "/me",
  authenticateUser,
  getCurrentUserProfile
);

// 🔒 GET USER BY ID
// Allows users to view their own profile OR admins to view any profile
router.get(
  "/:id",
  authenticateUser,
  checkPasswordExpiry,
  getUser
);

// 🔒 UPDATE USER
// Allows users to update their own profile OR admins to update any profile
router.put(
  "/:id",
  authenticateUser,
  checkPasswordExpiry,
  upload.single("profileImage"),
  updateUser
);

// 🔒 CHANGE PASSWORD
router.put(
  "/:id/change-password",
  authenticateUser,
  detectSuspiciousActivity,
  changePassword
);

module.exports = router;