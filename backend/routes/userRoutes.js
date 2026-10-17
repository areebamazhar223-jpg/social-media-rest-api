
const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

// Update logged-in user's profile
router.put("/profile", authMiddleware, updateUserProfile);

// Get a user's profile
router.get("/:userId/profile", authMiddleware, getUserProfile);

module.exports = router;
