require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require('xss-clean');
const helmet = require('helmet');

const connectDB = require("./config/db");
const { csrfProtection, attachCsrfToken } = require("./middlewares/csrf"); // 🔒 FIXED

const userRoutes = require("./routes/userRoute");
const twoFARoutes = require("./routes/2faRoutes");
const adminCategoryRoutes = require("./routes/admin/categoryRouteAdmin");
const adminProductRoutes = require("./routes/admin/productRouteAdmin");
const adminUserRoutes = require("./routes/admin/userRouteAdmin");
const bannerRoutes = require("./routes/admin/bannerRoute");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userCategoryRoutes = require("./routes/userCategoryRoute");
const userProductRoutes = require("./routes/userProductRoute");
const adminDashboardRoutes = require("./routes/admin/adminDashboardRoutes");
const esewaRoutes = require("./routes/esweaRoutes");

const app = express();
const server = http.createServer(app);

// ==========================================
// SOCKET.IO CONFIGURATION (BEFORE MIDDLEWARE)
// ==========================================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  // ✅ Additional Socket.IO security settings
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

global.io = io;

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================

// 1. 🛡️ HARDENED CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. 🛡️ REQUEST SIZE LIMITING
app.use(express.json({
  limit: '10kb',
  verify: (req, res, buf, encoding) => {
    if (buf.length > 10240) {
      console.warn(`⚠️ Large payload rejected: ${buf.length} bytes from ${req.ip}`);
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10kb',
  verify: (req, res, buf, encoding) => {
    if (buf.length > 10240) {
      console.warn(`⚠️ Large URL-encoded payload rejected: ${buf.length} bytes from ${req.ip}`);
    }
  }
}));

// 3. 🛡️ SECURITY HEADERS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "http://localhost:5173", "ws://localhost:5050"], // ✅ Added WebSocket
      },
    },
    frameguard: { action: "deny" },
    xContentTypeOptions: true,
  })
);

// 4. Cookie Parser (MUST come before CSRF)
app.use(cookieParser());

// 5. XSS Protection
app.use(xss());

// 6. 🛡️ NOSQL INJECTION PROTECTION
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  if (req.query) {
    req.query = mongoSanitize.sanitize(req.query, { replaceWith: '_' });
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  next();
});

// 7. 🔒 CSRF PROTECTION (FIXED - Now excludes Socket.IO)
app.use(csrfProtection);
app.use(attachCsrfToken);

// 8. Debug Middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Request:', req.method, req.path);
  }
  next();
});

// 9. Static Files
app.use(
  "/uploads",
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// DATABASE CONNECTION
// ==========================================
connectDB();

// ==========================================
// ERROR HANDLERS
// ==========================================
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    console.error(`❌ Payload too large from ${req.ip}: ${err.message}`);
    return res.status(413).json({
      success: false,
      message: 'Request payload too large. Maximum size is 10KB.',
      error: 'PAYLOAD_TOO_LARGE'
    });
  }

  // 🔒 CSRF Error Handler (should not trigger for Socket.IO anymore)
  if (err.code === 'EBADCSRFTOKEN') {
    console.error(`❌ CSRF Token Validation Failed from ${req.ip} on ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token. Please refresh and try again.',
      error: 'INVALID_CSRF_TOKEN'
    });
  }

  next(err);
});

// ==========================================
// ROUTES
// ==========================================
app.use("/api/auth", userRoutes);
app.use("/api/admin/category", adminCategoryRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/banner", bannerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/2fa", twoFARoutes);
app.use("/api/user/category", userCategoryRoutes);
app.use("/api/user/product", userProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/esewa", esewaRoutes);

module.exports = { app, server };