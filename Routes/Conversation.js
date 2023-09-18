const express = require("express");
const { verifyToken } = require("../Utils/JWT");
const { Conversation } = require("../Models");

const router = express.Router();

// Start/Open conversation
router.put("/", verifyToken, async (req, res) => {
  const { participant } = req.body;

  const existingConversation = await Conversation.findOne({
    participants: { $all: [req.userId, participant] },
  });
  if (existingConversation) return res.status(200).json(existingConversation);

  const conversation = new Conversation();
  conversation.partticipants.push(req.userId);
  conversation.partticipants.push(participant);

  await conversation.save();

  return res.status(200).json(conversation);
});

module.exports = router;

// Get all conversation of a user
router.get("/", verifyToken, async (req, res) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.userId] },
  });

  return res.status(200).json(conversations);
});

// Get conversation by Id
router.get("/:conversationId", verifyToken, async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  return res.status(200).json(conversation);
});

// Add message to conversation
router.post("/:conversationId", verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  const { message } = req.body;

  const conversation = await Conversation.findById(conversationId);

  conversation.messages.push({
    sender: req.userId,
    message,
  });

  await conversation.save();

  return res.status(200).json(conversation);
});
