
const express = require("express");
const router = express.Router();

const {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a notification
router.post("/", authMiddleware, createNotification);

// Get unread notifications count
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadNotificationsCount
);

// Mark all notifications as read
router.patch(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

// Get my notifications
router.get("/", authMiddleware, getMyNotifications);

// Mark one notification as read
router.patch(
  "/:notificationId/read",
  authMiddleware,
  markNotificationAsRead
);

// Delete a notification
router.delete(
  "/:notificationId",
  authMiddleware,
  deleteNotification
);

module.exports = router;
