const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/user/:userId", notificationController.getNotificationsByUser);
router.put("/:id/read", notificationController.markAsRead);

module.exports = router;