
const express = require("express");
const router = express.Router();

const {
  createComment,
  getPostComments,
  deleteComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

// Add a comment
router.post("/:postId/comments", authMiddleware, createComment);

// Get all comments of a post
router.get("/:postId/comments", authMiddleware, getPostComments);

// Delete your own comment
router.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  deleteComment
);

module.exports = router;