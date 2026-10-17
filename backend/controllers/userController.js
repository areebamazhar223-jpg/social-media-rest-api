
const mongoose = require("mongoose");
const User = require("../models/User");
const Follow = require("../models/Follow");
const Post = require("../models/Post");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const followersCount = await Follow.countDocuments({
      following: userId,
    });

    const followingCount = await Follow.countDocuments({
      follower: userId,
    });

    const postsCount = await Post.countDocuments({
      user: userId,
    });

    return res.status(200).json({
      message: "User profile fetched successfully",
      user,
      followersCount,
      followingCount,
      postsCount,
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      message: "Failed to fetch user profile",
    });
  }
};

// Update logged-in user's profile
const updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
