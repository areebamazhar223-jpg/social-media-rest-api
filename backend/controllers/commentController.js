
const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Create a comment
const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      text: text.trim(),
      user: req.user.id,
      post: postId,
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// Get all comments of a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: postId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      commentCount: comments.length,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get comments",
      error: error.message,
    });
  }
};

// Delete your own comment
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      post: postId,
      user: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or you cannot delete this comment",
      });
    }

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  deleteComment,
};
