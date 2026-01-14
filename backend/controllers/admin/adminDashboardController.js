// 🔒 ADMIN DASHBOARD CONTROLLER
// Location: backend/controllers/admin/adminDashboardController.js

const User = require("../../models/User");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Order = require("../../models/Order"); // If you have Order model
const path = require('path');
const fs = require('fs');

// 🔒 GET DASHBOARD STATISTICS (Admin Only)
exports.getDashboardStats = async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const normalUsers = await User.countDocuments({ role: 'normal' });
        const lockedAccounts = await User.countDocuments({
            accountLockedUntil: { $gt: Date.now() }
        });

        // Product statistics
        const totalProducts = await Product.countDocuments();
        
        // Category statistics
        const totalCategories = await Category.countDocuments();

        // Order statistics (if Order model exists)
        let orderStats = null;
        try {
            const totalOrders = await Order.countDocuments();
            const pendingOrders = await Order.countDocuments({ status: 'pending' });
            const completedOrders = await Order.countDocuments({ status: 'completed' });
            orderStats = { totalOrders, pendingOrders, completedOrders };
        } catch (err) {
            console.log("Order model not found, skipping order stats");
        }

        // Recent users (last 5)
        const recentUsers = await User.find()
            .select('-password -passwordHistory')
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    admins: adminUsers,
                    normal: normalUsers,
                    locked: lockedAccounts,
                    recent: recentUsers
                },
                products: {
                    total: totalProducts
                },
                categories: {
                    total: totalCategories
                },
                orders: orderStats
            }
        });
    } catch (err) {
        console.error("Get dashboard stats error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 🔒 GET SECURITY LOGS (Admin Only)
exports.getSecurityLogs = async (req, res) => {
    try {
        const { type = 'all', limit = 50 } = req.query;

        const logsDir = path.join(__dirname, '../../logs');
        let logFile;

        switch (type) {
            case 'failed-logins':
                logFile = path.join(logsDir, 'failed-logins.log');
                break;
            case 'suspicious':
                logFile = path.join(logsDir, 'suspicious-activity.log');
                break;
            default:
                logFile = path.join(logsDir, 'security.log');
        }

        // Check if file exists
        if (!fs.existsSync(logFile)) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No logs found"
            });
        }

        // Read log file
        const logs = fs.readFileSync(logFile, 'utf8')
            .split('\n')
            .filter(Boolean)
            .slice(-limit) // Last N entries
            .reverse(); // Most recent first

        return res.status(200).json({
            success: true,
            data: logs,
            count: logs.length,
            type: type
        });
    } catch (err) {
        console.error("Get security logs error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 🔒 UNLOCK USER ACCOUNT (Admin Only)
exports.unlockUserAccount = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent admin from unlocking themselves (unnecessary)
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot unlock your own account"
            });
        }

        // Reset lockout fields
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = undefined;
        await user.save();

        console.log(`🔓 ADMIN: ${req.user.email} unlocked account ${user.email}`);

        return res.status(200).json({
            success: true,
            message: `Account unlocked for ${user.email}`
        });
    } catch (err) {
        console.error("Unlock account error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};