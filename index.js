require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { initializeApp } = require("firebase-admin/app");

const firebaseApp = initializeApp();

const AuthRouter = require("./Routes/Authentication");
const UserRouter = require("./Routes/User");
const ConversationRouter = require("./Routes/Conversation");
const PostRouter = require("./Routes/Post");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", AuthRouter);
app.use("/api/user", UserRouter);
app.use("/api/post", PostRouter);
app.use("/api/conversation", ConversationRouter);

// Test endpoint
app.get("/api/test", (req, res) => {
  res.status(200).send("API is up and running!");
});

app.use("*", (req, res) => {
  return res.status(404).json({ msg: "Endpoint not found" });
});

//Connect to MongoDB
mongoose.set("strictQuery", true); // suppress warning
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Mongo has connected succesfully");
});
mongoose.connection.on("reconnected", () => {
  console.log("Mongo has reconnected");
});
mongoose.connection.on("error", (error) => {
  console.log("Mongo connection has an error", error);
  mongoose.disconnect();
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongo connection is disconnected");
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("hello", (data) => {
    console.log(data);
    socket.emit("test", { msg: data.msg });
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
