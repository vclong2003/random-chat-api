const express = require("express");
const { User } = require("../Models");
const { verifyToken } = require("../Utils/JWT");
const { default: mongoose } = require("mongoose");

const router = express.Router();

// GET user info
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId);

  return res.status(200).json({ id: user.id, username: user.username });
});

// Find user by username
router.get("/:username", verifyToken, async (req, res) => {
  const { username } = req.params;

  const users = await User.find(
    { username: { $regex: `${username}` } },
    "id username avatarUrl"
  );

  return res.status(200).json(users);
});

// Update user name
router.put("/username", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  if (userId !== req.user.id) return res.sendStatus(403);

  await User.findByIdAndUpdate(userId, { username: username });

  return res.sendStatus(200);
});

// Follow a user
router.post("/:followId/follow", verifyToken, async (req, res) => {
  const { followId } = req.params;
  const { userId } = req;

  try {
    await User.findByIdAndUpdate(followId, {
      $addToSet: { followers: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: followId },
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

// Unfollow a user
router.delete("/:unfollowId/follow", verifyToken, async (req, res) => {
  const { unfollowId } = req.params;
  const { userId } = req;

  try {
    await User.findByIdAndUpdate(userId, { $pull: { following: unfollowId } });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

module.exports = router;
