import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userRoutes from "./routes/routes.js";
import cors from "cors";
import User from "./models/user.js";

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(cors("*"));

// Use the routes for user-related actions
app.use("/api/users", userRoutes);

// connect to database
const mongoURI =
  "mongodb+srv://mysapiensio:CV5oYI24UPdKdjQL@cluster0.ndxx7.mongodb.net";

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
}
connectDB();

// Configure Socket.IO with CORS options
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend's URL
    methods: ["GET", "POST", "OPTIONS"],
  },
});

// Map to store user IDs and their associated socket IDs
const socketMap = new Map();
const connectedUsers = {};

io.on("connection", (socket) => {
  socket.on("connected", () => {
    console.log("connected to socket");
  });
  // When a user logs in, store the socket id associated with userId
  socket.on("login", (userId) => {
    if (!userId) {
      console.error("Error: userId is required for login.");
      return;
    }
    socketMap.set(userId, socket.id);
    console.log(`User ${userId} logged in with socket ID ${socket.id}`);
  });

  // Event to handle private messaging
  socket.on(
    "private_message",
    ({ senderId, receiverId, message }, callback) => {
      if (!senderId || !receiverId) {
        console.error("Error: Missing senderId or receiverId.");
        callback?.({
          success: false,
          error: "Missing senderId or receiverId.",
        });
        return;
      }
      const receiverSocketId = socketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message", { senderId, message });
        console.log(
          `Message sent from ${senderId} to ${receiverId}: ${message}`
        );
        callback?.({ success: true });
      } else {
        console.log(`User ${receiverId} is not online.`);
        callback?.({ success: false, error: "Receiver is not online." });
      }
    }
  );

  // Handle disconnections and clean up the socket map
  socket.on("disconnect", () => {
    // Loop through the socketMap to find and delete the user that disconnected
    for (let [userId, socketId] of socketMap.entries()) {
      if (socketId === socket.id) {
        socketMap.delete(userId); // Remove the disconnected user from the map
        console.log(`User ${userId} disconnected`);
      }
    }
  });
});

server.listen(3333, () => {
  console.log("Server running at http://localhost:3333");
});
