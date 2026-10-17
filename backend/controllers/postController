
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user.id,
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      message: "Failed to create post",
    });
  }
};

// Get all posts with pagination
const getAllPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    return res.status(200).json({
      message: "Posts fetched successfully",
      currentPage: page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      postCount: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return res.status(500).json({
      message: "Failed to get posts",
    });
  }
};

// Get logged-in user's posts
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "My posts fetched successfully",
      postCount: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    return res.status(500).json({
      message: "Failed to get your posts",
    });
  }
};

// Search posts by title or content
const searchPosts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (
      typeof keyword !== "string" ||
      !keyword.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a search keyword",
      });
    }

    // Escape special regular-expression characters
    const safeKeyword = keyword
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const posts = await Post.find({
      $or: [
        {
          title: {
            $regex: safeKeyword,
            $options: "i",
          },
        },
        {
          content: {
            $regex: safeKeyword,
            $options: "i",
          },
        },
      ],
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Posts searched successfully",
      keyword: keyword.trim(),
      postCount: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Search posts error:", error);
    return res.status(500).json({
      message: "Failed to search posts",
    });
  }
};

// Get a single post by ID
const getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", "name email");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Get single post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Failed to get post",
    });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body || {};

    if (title === undefined && content === undefined) {
      return res.status(400).json({
        message: "Please provide title or content to update",
      });
    }

    if (
      (title !== undefined &&
        (typeof title !== "string" || !title.trim())) ||
      (content !== undefined &&
        (typeof content !== "string" || !content.trim()))
    ) {
      return res.status(400).json({
        message: "Title and content must be non-empty strings",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this post",
      });
    }

    if (title !== undefined) {
      post.title = title.trim();
    }

    if (content !== undefined) {
      post.content = content.trim();
    }

    await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Failed to update post",
    });
  }
};

// Delete a post and its related likes and comments
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
      });
    }

    await Like.deleteMany({ post: postId });
    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      message: "Post, likes, and comments deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    return res.status(500).json({
      message: "Failed to delete post",
    });
  }
};

// Export all controller functions
module.exports = {
  createPost,
  getAllPosts,
  getMyPosts,
  searchPosts,
  getSinglePost,
  updatePost,
  deletePost,
};
