const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categorymanagement');
const upload = require("../../middlewares/fileupload");
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUsers");

// 🔒 CREATE CATEGORY (Admin Only)
router.post(
    '/',
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    upload.single("image"),
    categoryController.createCategory
);

// 🔓 GET ALL CATEGORIES (Public - anyone can view)
router.get('/', categoryController.getAllCategories);

// 🔓 GET CATEGORY BY ID (Public - anyone can view)
router.get('/:id', categoryController.getCategoryById);

// 🔒 UPDATE CATEGORY (Admin Only)
router.put(
    '/:id',
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    upload.single("image"),
    categoryController.updateCategory
);

// 🔒 DELETE CATEGORY (Admin Only)
router.delete(
    '/:id',
    authenticateUser,  // ✅ Check if logged in
    isAdmin,           // 🔒 Check if admin
    categoryController.deleteCategory
);

module.exports = router;