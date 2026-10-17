
const express = require("express");
const router = express.Router();

const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} = require("../controllers/followController");

const authMiddleware = require("../middleware/authMiddleware");

// Follow a user
router.post("/:userId/follow", authMiddleware, followUser);

// Unfollow a user
router.delete("/:userId/follow", authMiddleware, unfollowUser);

// Check whether logged-in user follows this user
router.get(
  "/:userId/follow-status",
  authMiddleware,
  checkFollowStatus
);

// Get followers list and count
router.get("/:userId/followers", authMiddleware, getFollowers);

// Get following list and count
router.get("/:userId/following", authMiddleware, getFollowing);

module.exports = router;
