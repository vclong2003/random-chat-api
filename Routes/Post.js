const express = require("express");
const router = express.Router();
const { Post } = require("../Models");
const { verifyToken } = require("../Utils/JWT");

// GET: /post
// Get all posts
router.get("/", verifyToken, async (req, res) => {
  const posts = await Post.find({}).populate("user");

  return res.status(200).json(posts);
});

// POST: /post
// Create a post
// data = [{type: "text", content: "string, ..."}]
router.post("/", verifyToken, async (req, res) => {
  const { data } = req.body;
  const { userId } = req;

  const post = await Post.create({
    user: userId,
    content: data, // text only for now
    time: Date.now(),
  });

  return res.status(200).json(post);
});

// DELETE: /post/:postId
// Delete a post
router.delete("/:postId", verifyToken, async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;

  try {
    await Post.findOneAndDelete({ _id: postId, user: userId });
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  return res.status(200);
});

// POST: /post/:postId/like
// Like a post
router.post("/:postId/like", verifyToken, async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  return res.status(200).json(post);
});

// Unlike a post
router.delete("/:postId/like", verifyToken, async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  return res.status(200).json(post);
});

// Comment on a post
router.post("/:postId/comment", verifyToken, async (req, res) => {
  const { userId } = req;
  const { postId } = req.params;
  const { content } = req.body;

  const comment = {
    user: userId,
    content: content,
    time: Date.now(),
  };

  let post;
  try {
    post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  return res.status(200).json(post);
});

// Delete a comment
router.delete("/:postId/comment/:commentId", verifyToken, async (req, res) => {
  const { userId } = req;
  const { postId, commentId } = req.params;

  let post;
  try {
    post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId, user: userId } } },
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  return res.status(200).json(post);
});

module.exports = router;
