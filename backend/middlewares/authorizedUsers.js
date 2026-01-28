const jwt = require("jsonwebtoken");
const User = require("../models/User");


exports.authenticateUser = async (req, res, next) => {
    try {
    
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log("   ✅ Token verified, user ID:", decoded._id);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }
        if (user.passwordChangedAt) {
            const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({
                    success: false,
                    message: "Password recently changed, login again.",
                    requiresRelogin: true
                });
            }
        }

        if (user.isAccountLocked && user.isAccountLocked()) {
            const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account locked. So try again in ${lockTimeRemaining} minutes.`
            });
        }
        req.user = user;
        next();

    } catch (err) {
        console.error("❌ Authentication error:", err.message);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again.",
                tokenExpired: true
            });
        }
        return res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
};

// Admin authorization middleware 
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
};