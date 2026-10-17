
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// 1. Create a notification
const createNotification = async (req, res) => {
  try {
    const { recipient, type, post, message } = req.body;
    const sender = req.user.id;

    if (!recipient || !type || !message) {
      return res.status(400).json({
        message: "Recipient, type and message are required",
      });
    }

    if (!["follow", "like", "comment"].includes(type)) {
      return res.status(400).json({
        message: "Invalid notification type",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      return res.status(400).json({
        message: "Invalid recipient ID",
      });
    }

    if (String(recipient) === String(sender)) {
      return res.status(400).json({
        message: "You cannot send a notification to yourself",
      });
    }

    if (post && !mongoose.Types.ObjectId.isValid(post)) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post: post || null,
      message,
    });

    return res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      message: "Failed to create notification",
    });
  }
};

// 2. Get notifications with pagination and filters
const getMyNotifications = async (req, res) => {
  try {
    const parsedPage = parseInt(req.query.page, 10);
    const parsedLimit = parseInt(req.query.limit, 10);

    const page = Number.isFinite(parsedPage)
      ? Math.max(1, parsedPage)
      : 1;

    const limit = Number.isFinite(parsedLimit)
      ? Math.min(50, Math.max(1, parsedLimit))
      : 10;

    const { isRead, type } = req.query;

    const filter = {
      recipient: req.user.id,
    };

    if (isRead !== undefined) {
      if (!["true", "false"].includes(isRead)) {
        return res.status(400).json({
          message: "isRead must be true or false",
        });
      }

      filter.isRead = isRead === "true";
    }

    if (type !== undefined) {
      if (!["follow", "like", "comment"].includes(type)) {
        return res.status(400).json({
          message: "Invalid notification type",
        });
      }

      filter.type = type;
    }

    const totalNotifications =
      await Notification.countDocuments(filter);

    const notifications = await Notification.find(filter)
      .populate("sender", "name email")
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      message: "Notifications fetched successfully",
      totalNotifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      limit,
      filters: {
        isRead: isRead ?? "all",
        type: type ?? "all",
      },
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

// 3. Mark one notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipient: req.user.id,
      },
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    return res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

// 4. Mark all unread notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};

// 5. Get unread notifications count
const getUnreadNotificationsCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return res.status(200).json({
      message: "Unread notifications count fetched successfully",
      unreadCount,
    });
  } catch (error) {
    console.error("Unread notifications count error:", error);

    return res.status(500).json({
      message: "Failed to fetch unread notifications count",
    });
  }
};

// 6. Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
      notification,
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    return res.status(500).json({
      message: "Failed to delete notification",
    });
  }
};

// Export all controller functions
module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteNotification,
};
