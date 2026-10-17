
const express = require("express");
const router = express.Router();

const {
  likePost,
  unlikePost,
  getPostLikes,
} = require("../controllers/likeController");

const authMiddleware = require("../middleware/authMiddleware");

// Like a post
router.post("/:postId/like", authMiddleware, likePost);

// Unlike a post
router.delete("/:postId/like", authMiddleware, unlikePost);

// Get like count and current user's status
router.get("/:postId/likes", authMiddleware, getPostLikes);

module.exports = router;
