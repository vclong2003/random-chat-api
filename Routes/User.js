const express = require("express");
const { User } = require("../Models");
const { verifyToken } = require("../Utils/JWT");
const { default: mongoose } = require("mongoose");

const router = express.Router();

// GET user info
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId);

  return res
    .status(200)
    .json({ id: user.id, phone: user.phone, username: user.username });
});

// Find user by phone
router.get("/:phone", verifyToken, async (req, res) => {
  const { phone } = req.params;

  const users = await User.find(
    { phone: { $regex: `${phone}` } },
    "id phone username avatarUrl"
  );

  return res.status(200).json(users);
});

// Update user name
router.put("/:userId/username", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  if (userId !== req.user.id) return res.sendStatus(403);

  await User.findByIdAndUpdate(userId, { username: username });

  return res.sendStatus(200);
});

module.exports = router;
