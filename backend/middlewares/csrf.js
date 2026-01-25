const csrf = require('csurf');

// 🔒 CSRF Protection Middleware
// Protects against Cross-Site Request Forgery attacks
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    }
});

// Middleware to attach CSRF token to response
const attachCsrfToken = (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false, // Frontend needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    next();
};

module.exports = { csrfProtection, attachCsrfToken };