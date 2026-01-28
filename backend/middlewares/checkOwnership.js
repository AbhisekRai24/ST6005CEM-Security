const checkOwnership = (paramName = 'id', allowAdmin = true) => {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;

    // Allow admins to access anything
    if (allowAdmin && userRole === 'admin') {
      return next();
    }

    if (userId !== targetId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources."
      });
    }

    next();
  };
};

module.exports = checkOwnership;