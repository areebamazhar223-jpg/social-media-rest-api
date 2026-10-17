
const express = require("express");
const router = express.Router();

const {
  createPost,
  getAllPosts,
  getMyPosts,
  searchPosts,
  getSinglePost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const { getFeed } = require("../controllers/feedController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new post
router.post("/", authMiddleware, createPost);

// Get all posts with pagination
router.get("/", authMiddleware, getAllPosts);

// Get logged-in user's own posts
router.get("/my-posts", authMiddleware, getMyPosts);

// Search posts
router.get("/search", authMiddleware, searchPosts);

// Get feed posts
router.get("/feed", authMiddleware, getFeed);

// Get a single post by ID
router.get("/:postId", authMiddleware, getSinglePost);

// Update a post
router.put("/:postId", authMiddleware, updatePost);

// Delete a post
router.delete("/:postId", authMiddleware, deletePost);

module.exports = router;
