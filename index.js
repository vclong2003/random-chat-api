require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

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

const messages = {};
const availableRooms = [];

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);
  let room;

  const sendWaiting = () => {
    io.to(room).emit("waiting");
  };
  const sendReady = () => {
    io.to(room).emit("ready");
  };
  const sendMessagesToRoom = () => {
    io.to(room).emit("receive-message", messages[room]);
  };

  if (availableRooms.length == 0) {
    // No rooms available
    room = uuidv4();
    socket.join(room);
    availableRooms.push(room);

    messages[room] = [];
  } else {
    // Room available
    room = availableRooms.pop();
    socket.join(room);

    messages[room] = [];
    sendMessagesToRoom();
  }

  if (io.sockets.adapter.rooms.get(room).size == 2) {
    sendReady();
  } else {
    sendWaiting();
  }

  socket.on("send-message", (data) => {
    const newMsg = {
      sender: socket.id,
      content: data.msg,
      time: Date.now(),
    };

    messages[room].push(newMsg);

    sendMessagesToRoom();
  });

  socket.on("disconnect", () => {
    sendWaiting();
    availableRooms.push(room);
    console.log(`User disconnected ${socket.id}`);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
