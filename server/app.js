import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const secretkey = process.env.JWT_SECRET;
const origin = process.env.ORIGIN

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: origin,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to chat app");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "123456" }, secretkey);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      success: true,
      message: "Login Success",
    });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authorization Error!"));

    const decodedCode = jwt.decode(token, secretkey);
    next();
  });
});

io.on("connection", (socket) => {
  console.log("user connected ", socket.id);

  socket.emit("welcome", `welcome to the chat app ${socket.id}`);

  socket.on("message", ({ message, room }) => {
    console.log(message);
    socket.to(room).emit("receive-message", message);
  });

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`user joined room ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected ", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
