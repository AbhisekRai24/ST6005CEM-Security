const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔒 ENHANCED: Cookie-based Authentication Middleware
exports.authenticateUser = async (req, res, next) => {
    try {
        // 🔒 STEP 1: Get token from HTTP-only cookie (NOT Authorization header)
        const token = req.cookies.token;
        console.log('🍪 ALL COOKIES:', req.cookies);
        console.log('🔍 Headers:', req.headers);

        console.log("🔍 AUTH MIDDLEWARE - REQUEST TO:", req.path);
        console.log("   Cookie token exists:", !!token);
        console.log("   Token (first 30 chars):", token?.substring(0, 30));

        if (!token) {
            console.log("   ❌ No token in cookies");
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }

        // 🔒 STEP 2: Verify token
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log("   ✅ Token verified, user ID:", decoded._id);

        // 🔒 STEP 3: Check if user still exists
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            console.log("   ❌ User not found in database");
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        console.log("   ✅ User found:", user.email);

        // 🔒 STEP 4: Check if password changed after token was issued (SESSION FIXATION PROTECTION)
        if (user.passwordChangedAt) {
            const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);

            if (decoded.iat < changedTimestamp) {
                console.log("   ⚠️ Password changed after token issued");
                return res.status(401).json({
                    success: false,
                    message: "Password recently changed. Please login again.",
                    requiresRelogin: true
                });
            }
        }

        // 🔒 STEP 5: Check if account is locked
        if (user.isAccountLocked && user.isAccountLocked()) {
            const lockTimeRemaining = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
            console.log("   ⚠️ Account is locked");
            return res.status(403).json({
                success: false,
                message: `Account locked. Try again in ${lockTimeRemaining} minutes.`
            });
        }

        console.log("   ✅ All checks passed, attaching user to request");

        // 🔒 STEP 6: Attach user to request
        req.user = user;
        next();

    } catch (err) {
        console.error("❌ Authentication error:", err.message);

        // 🔒 Handle specific JWT errors
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

// Admin authorization middleware (unchanged)
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