const { string } = require("@withvoid/make-validation/lib/validationTypes");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  phone: String,
  password: String,
  dob: Date,
  avatarUrl: String,
});
const User = mongoose.model("User", userSchema);

const refreshTokenSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
});
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

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
const Post = mongoose.model("Post", postSchema);

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
const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = { User, RefreshToken, Conversation };
