

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login first."
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`🚫 RBAC: User ${req.user.email} (role: ${req.user.role}) attempted to access ${req.method} ${req.path}`);

            return res.status(403).json({
                success: false,
                message: "Access denied. You do not have permission to perform this action.",
                requiredRole: allowedRoles,
                userRole: req.user.role
            });
        }

        console.log(`✅ RBAC: User ${req.user.email} (role: ${req.user.role}) authorized for ${req.method} ${req.path}`);
        next();
    };
};

module.exports = authorize;