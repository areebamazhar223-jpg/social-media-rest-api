
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// Like routes
app.use("/api/posts", likeRoutes);

// Comment routes
app.use("/api/posts", commentRoutes);

// Follow and Unfollow routes
app.use("/api/users", followRoutes);

// User Profile routes
app.use("/api/users", userRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Like API is running",
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
