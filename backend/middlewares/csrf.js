// 🔒 CSRF PROTECTION MIDDLEWARE (FIXED FOR SOCKET.IO)
// Location: backend/middlewares/csrf.js

const csrf = require('csurf');

// 🔒 CSRF Protection Middleware with Socket.IO exemption
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    },
    // ✅ CRITICAL FIX: Ignore CSRF for Socket.IO upgrade requests
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// ✅ Conditional CSRF protection that excludes Socket.IO
const conditionalCsrfProtection = (req, res, next) => {
    // Skip CSRF for Socket.IO connections
    if (req.path === '/socket.io/' || req.path.startsWith('/socket.io/')) {
        console.log('⚡ Skipping CSRF for Socket.IO connection');
        return next();
    }

    // Skip CSRF for WebSocket upgrade requests
    if (req.headers.upgrade === 'websocket') {
        console.log('⚡ Skipping CSRF for WebSocket upgrade');
        return next();
    }

    // Apply CSRF protection for all other routes
    csrfProtection(req, res, next);
};

// Middleware to attach CSRF token to response
const attachCsrfToken = (req, res, next) => {
    // Skip for Socket.IO
    if (req.path === '/socket.io/' || req.path.startsWith('/socket.io/')) {
        return next();
    }

    // Skip if csrfToken function doesn't exist (Socket.IO case)
    if (!req.csrfToken) {
        return next();
    }

    try {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false, // Frontend needs to read this
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
    } catch (err) {
        // If CSRF token generation fails, just continue
        console.warn('⚠️ CSRF token generation skipped:', err.message);
    }

    next();
};

module.exports = { 
    csrfProtection: conditionalCsrfProtection, 
    attachCsrfToken 
};