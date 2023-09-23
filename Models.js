const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  phone: String,
  email: String,
  password: String,
  dob: Date,
  avatarUrl: String,
  coverUrl: String,
  bio: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const refreshTokenSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
});

const postSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: [
    {
      type: { type: String, enum: ["text", "image", "video"] },
      content: String,
    },
  ],
  time: Date,
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      time: Date,
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const conversationSchema = new Schema({
  partticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      time: Date,
    },
  ],
});

const User = mongoose.model("User", userSchema);
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
const Post = mongoose.model("Post", postSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { User, RefreshToken, Post, Conversation };
