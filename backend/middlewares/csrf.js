
const csrf = require('csurf');
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    },
  
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

const conditionalCsrfProtection = (req, res, next) => {
    if (req.path === '/socket.io/' || req.path.startsWith('/socket.io/')) {
        console.log('⚡ Skipping CSRF for Socket.IO connection');
        return next();
    }

    if (req.headers.upgrade === 'websocket') {
        console.log('⚡ Skipping CSRF for WebSocket upgrade');
        return next();
    }
    csrfProtection(req, res, next);
};


const attachCsrfToken = (req, res, next) => {
    if (req.path === '/socket.io/' || req.path.startsWith('/socket.io/')) {
        return next();
    }

    if (!req.csrfToken) {
        return next();
    }

    try {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
    } catch (err) {
        
        console.warn('CSRF token generation skipped:', err.message);
    }

    next();
};

module.exports = { 
    csrfProtection: conditionalCsrfProtection, 
    attachCsrfToken 
};