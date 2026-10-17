
const Like = require("../models/Like");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// Like a post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Check if user already liked this post
    const existingLike = await Like.findOne({
      user: userId,
      post: postId,
    });

    if (existingLike) {
      return res.status(409).json({
        message: "You already liked this post",
      });
    }

    // Save like
    await Like.create({
      user: userId,
      post: postId,
    });

    // Create notification for post owner
    let notificationCreated = false;

    // Do not notify when user likes their own post
    if (String(post.author) !== String(userId)) {
      try {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: post._id,
          message: "Someone liked your post",
        });

        notificationCreated = true;
      } catch (notificationError) {
        console.error(
          "Like notification error:",
          notificationError
        );
      }
    }

    // Get updated like count
    const likeCount = await Like.countDocuments({
      post: postId,
    });

    return res.status(201).json({
      message: "Post liked successfully",
      liked: true,
      likeCount,
      notificationCreated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already liked this post",
      });
    }

    console.error("Like error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const deletedLike = await Like.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (!deletedLike) {
      return res.status(404).json({
        message: "Like not found",
      });
    }

    const likeCount = await Like.countDocuments({
      post: postId,
    });

    return res.status(200).json({
      message: "Post unliked successfully",
      liked: false,
      likeCount,
    });
  } catch (error) {
    console.error("Unlike error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get like count and current user's like status
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const likeCount = await Like.countDocuments({
      post: postId,
    });

    const likedByUser = await Like.exists({
      user: userId,
      post: postId,
    });

    return res.status(200).json({
      likeCount,
      liked: Boolean(likedByUser),
    });
  } catch (error) {
    console.error("Get likes error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
};
