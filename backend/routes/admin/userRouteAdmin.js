const express = require("express");
const router = express.Router();
const {
    createUser,
    getAllUsers,  // ✅ CHANGED: was 'getUsers', now 'getAllUsers'
    getOneUser,
    updateOne,
    deleteOne
} = require("../../controllers/admin/usermanagement");
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUsers");

// 🔒 CREATE USER (Admin Only)
router.post(
    "/",
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    createUser
);

// 🔒 GET ALL USERS (Admin Only)
router.get(
    "/",
    authenticateUser,
    isAdmin,
    getAllUsers  // ✅ CHANGED: was 'getUsers', now 'getAllUsers'
);

// 🔒 GET ONE USER (Admin Only)
router.get(
    "/:id",
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    getOneUser
);

// 🔒 UPDATE USER (Admin Only)
router.put(
    "/:id",
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    updateOne
);

// 🔒 DELETE USER (Admin Only)
router.delete(
    "/:id",
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    deleteOne
);


// Add this to your admin routes: GET /api/admin/users

module.exports = router;