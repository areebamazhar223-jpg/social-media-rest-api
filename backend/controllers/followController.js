
const mongoose = require("mongoose");
const Follow = require("../models/Follow");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Follow a user
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (String(followerId) === String(userId)) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingFollow) {
      return res.status(409).json({
        message: "You already follow this user",
      });
    }

    // Save the follow relationship
    await Follow.create({
      follower: followerId,
      following: userId,
    });

    // Get the follower's name for the notification
    const follower = await User.findById(followerId);

    // Create a notification for the user being followed
    await Notification.create({
      recipient: userId,
      sender: followerId,
      type: "follow",
      message: `${follower.name} started following you`,
    });

    return res.status(201).json({
      message: "User followed successfully",
      following: true,
      notificationCreated: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already follow this user",
      });
    }

    console.error("Follow user error:", error);

    return res.status(500).json({
      message: "Failed to follow user",
    });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (String(followerId) === String(userId)) {
      return res.status(400).json({
        message: "You cannot unfollow yourself",
      });
    }

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!follow) {
      return res.status(404).json({
        message: "You are not following this user",
      });
    }

    return res.status(200).json({
      message: "User unfollowed successfully",
      following: false,
    });
  } catch (error) {
    console.error("Unfollow user error:", error);

    return res.status(500).json({
      message: "Failed to follow user",
    });
  }
};

// Get a user's followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follows = await Follow.find({
      following: userId,
    })
      .populate("follower", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      followerCount: follows.length,
      followers: follows.map((follow) => follow.follower),
    });
  } catch (error) {
    console.error("Get followers error:", error);

    return res.status(500).json({
      message: "Failed to get followers",
    });
  }
};

// Get users this user follows
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follows = await Follow.find({
      follower: userId,
    })
      .populate("following", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      followingCount: follows.length,
      following: follows.map((follow) => follow.following),
    });
  } catch (error) {
    console.error("Get following error:", error);

    return res.status(500).json({
      message: "Failed to get following",
    });
  }
};

// Check whether the logged-in user follows another user
const checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (String(followerId) === String(userId)) {
      return res.status(200).json({
        following: false,
        isSelf: true,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const follow = await Follow.exists({
      follower: followerId,
      following: userId,
    });

    return res.status(200).json({
      following: Boolean(follow),
    });
  } catch (error) {
    console.error("Check follow status error:", error);

    return res.status(500).json({
      message: "Failed to check follow status",
    });
  }
};

// Export controller functions
module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
};
