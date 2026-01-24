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
const userRoutes = require("./routes/userRoute");
const twoFARoutes = require("./routes/2faRoutes");

const adminCategoryRoutes = require("./routes/admin/categoryRouteAdmin");
const adminProductRoutes = require("./routes/admin/productRouteAdmin");
const adminUserRoutes = require("./routes/admin/userRouteAdmin");
const bannerRoutes = require("./routes/admin/bannerRoute");
const orderRoutes = require("./routes/orderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const esewaRoutes = require('./routes/esewaRoute');
const userCategoryRoutes = require("./routes/userCategoryRoute");
const userProductRoutes = require("./routes/userProductRoute");
const adminDashboardRoutes = require("./routes/admin/adminDashboardRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
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
    // Allow requests from your frontend or no origin (mobile apps, Postman)
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173', // Development frontend
    ];

    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Allowed headers
  exposedHeaders: ['set-cookie'], // Headers that client can access
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 200 // For legacy browsers
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// 2. Body Parsers
// 2. 🛡️ REQUEST SIZE LIMITING (DoS Protection)
// Limit JSON payloads to 10kb
app.use(express.json({
  limit: '10kb',
  verify: (req, res, buf, encoding) => {
    // Optional: Log large payload attempts
    if (buf.length > 10240) { // 10kb in bytes
      console.warn(`⚠️ Large payload rejected: ${buf.length} bytes from ${req.ip}`);
    }
  }
}));

// Limit URL-encoded data to 10kb
app.use(express.urlencoded({
  extended: true,
  limit: '10kb',
  verify: (req, res, buf, encoding) => {
    if (buf.length > 10240) {
      console.warn(`⚠️ Large URL-encoded payload rejected: ${buf.length} bytes from ${req.ip}`);
    }
  }
}));


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "http://localhost:5173"],
      },
    },
    frameguard: { action: "deny" }, // Anti-clickjacking
    xContentTypeOptions: true,       // nosniff
  })
);



// 3. Cookie Parser
app.use(cookieParser());
// xss protection
app.use(xss());
// 4. 🛡️ NOSQL INJECTION PROTECTION (Express v5 Compatible) - SIMPLE VERSION
app.use((req, res, next) => {
  // Sanitize req.body
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, {
      replaceWith: '_'
    });
  }

  // Sanitize req.query
  if (req.query) {
    req.query = mongoSanitize.sanitize(req.query, {
      replaceWith: '_'
    });
  }

  // Sanitize req.params
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params, {
      replaceWith: '_'
    });
  }

  next();
});

// 5. Debug Middleware (Optional - can remove in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🍪 Cookies received:', req.cookies);
  }
  next();
});


// 6A. ✅ Allow cross-origin access ONLY for static images
app.use(
  "/uploads",
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// 6. Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// DATABASE CONNECTION
// ==========================================
connectDB();

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

  // Pass other errors to default handler
  next(err);
});
// ROUTES
// ==========================================
app.use("/api/auth", userRoutes);
app.use("/api/admin/category", adminCategoryRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/banner", bannerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/esewa', esewaRoutes);
app.use("/api/2fa", twoFARoutes);
app.use("/api/user/category", userCategoryRoutes);
app.use("/api/user/product", userProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);


module.exports = { app, server };