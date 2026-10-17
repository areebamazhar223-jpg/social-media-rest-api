
const Follow = require("../models/Follow");
const Post = require("../models/Post");

// Get feed posts from followed users
const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find users followed by the logged-in user
    const follows = await Follow.find({
      follower: userId,
    }).select("following");

    const followingIds = follows.map(
      (follow) => follow.following
    );

    // Include the user's own posts in the feed
    const feedUserIds = [...followingIds, userId];

    // Get posts from followed users and yourself
    const posts = await Post.find({
      author: { $in: feedUserIds },
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Feed fetched successfully",
      postCount: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Get feed error:", error);

    return res.status(500).json({
      message: "Failed to fetch feed",
    });
  }
};

module.exports = { getFeed };
