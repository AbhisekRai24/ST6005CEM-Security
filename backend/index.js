require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoute");
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

// 1. CORS Configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie Parser
app.use(cookieParser());



// 5. Debug Middleware (Optional - can remove in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🍪 Cookies received:', req.cookies);
  }
  next();
});

// 6. Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// DATABASE CONNECTION
// ==========================================
connectDB();

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
app.use('/api/esewa', esewaRoutes);
app.use("/api/user/category", userCategoryRoutes);
app.use("/api/user/product", userProductRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);


module.exports = { app, server };