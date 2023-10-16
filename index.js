require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

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

// Test endpoint
app.get("/api/test", (req, res) => {
  res.status(200).send("API is up and running!");
});

app.use("*", (req, res) => {
  return res.status(404).json({ msg: "Endpoint not found" });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  const msg = [];

  socket.on("send-message", (data) => {
    const newMsg = {
      id: socket.id,
      msg: data.msg,
      time: Date.now().toLocaleString(),
    };

    msg.push(newMsg);

    socket.emit("receive-message", { msg: msg });
  });

  socket.on("join", () => {
    console.log("User want to join");
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
