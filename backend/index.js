

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // 🔒 NEW


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

const nodemailer = require("nodemailer");




const app = express();
const server = http.createServer(app); // 👈 Create server manually
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // 🔒 Change to your frontend URL
    methods: ["GET", "POST"],
    credentials: true // 🔒 Allow cookies
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

// 🌍 Middleware
app.use(cors({
  origin: "http://localhost:5173", // 🔒 Change to your frontend URL
  credentials: true // 🔒 Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // 🔒 NEW: Parse cookies
// 🔍 Debug middleware to verify cookie-parser is working
app.use((req, res, next) => {
  console.log('🍪 Cookies received:', req.cookies);
  console.log('📦 Raw cookie header:', req.headers.cookie);
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📦 Connect to MongoDB
connectDB();

// 🛣️ Routes
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