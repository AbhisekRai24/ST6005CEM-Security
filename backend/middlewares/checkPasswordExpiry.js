// 🔒 PASSWORD EXPIRY MIDDLEWARE (Feature #4)
// Place this file in: backend/middlewares/checkPasswordExpiry.js

const PASSWORD_MAX_AGE = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

/**
 * Middleware to check if user's password has expired
 * Forces password change after PASSWORD_MAX_AGE days
 */
const checkPasswordExpiry = (req, res, next) => {
    try {
        // Check if user exists in request (set by authenticateUser middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const passwordChangedAt = req.user.passwordChangedAt;

        // If no passwordChangedAt field, allow (backward compatibility)
        if (!passwordChangedAt) {
            return next();
        }

        // Calculate password age
        const passwordAge = Date.now() - new Date(passwordChangedAt).getTime();
        const isExpired = passwordAge > PASSWORD_MAX_AGE;

        if (isExpired) {
            const daysExpired = Math.floor(passwordAge / (24 * 60 * 60 * 1000)) - 90;

            return res.status(403).json({
                success: false,
                message: `Password expired ${daysExpired} days ago. Please reset your password to continue.`,
                passwordExpired: true,
                passwordChangedAt: passwordChangedAt
            });
        }

        // 🔒 WARN if password will expire soon (within 7 days)
        const daysUntilExpiry = Math.floor((PASSWORD_MAX_AGE - passwordAge) / (24 * 60 * 60 * 1000));
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            // Add warning to response headers
            res.setHeader('X-Password-Expiry-Warning', `Password expires in ${daysUntilExpiry} days`);
        }

        next();
    } catch (err) {
        console.error("Password expiry check error:", err);
        return res.status(500).json({
            success: false,
            message: "Error checking password expiry"
        });
    }
};

module.exports = checkPasswordExpiry;