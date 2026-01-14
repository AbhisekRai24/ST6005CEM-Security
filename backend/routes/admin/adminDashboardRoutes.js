// 🔒 ADMIN DASHBOARD ROUTES
// Location: backend/routes/admin/adminDashboardRoutes.js

const express = require("express");
const router = express.Router();
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUsers");
const {
    getDashboardStats,
    getSecurityLogs,
    unlockUserAccount
} = require("../../controllers/admin/adminDashboardController");

// ========== DASHBOARD ==========

// Get dashboard statistics
router.get(
    "/stats",
    authenticateUser,
    isAdmin,
    getDashboardStats
);

// ========== SECURITY ==========

// Get security logs
router.get(
    "/security-logs",
    authenticateUser,
    isAdmin,
    getSecurityLogs
);

// Unlock user account
router.post(
    "/users/:id/unlock",
    authenticateUser,
    isAdmin,
    unlockUserAccount
);

module.exports = router;