import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userRoutes from "./routes/user.routes.js";
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
const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("online", async (username) => {
    console.log(username, "connected to socket");

    try {
      // Find the user in the database
      const user = await User.findOne({ username });

      if (user) {
        // Update the user's online status in the database
        user.online = true;
        await user.save();

        // Update onlineUsers and socketMap
        onlineUsers.set(user._id, username);
        socketMap.set(user._id, socket.id);

        // Broadcast only the username of the online user
        io.emit("user-online", { username, userId: user._id, online: true });

        // Emit the current online users
        // socket.emit("current-online-users", Array.from(onlineUsers.values()));

        console.log("User is now online:", username);
      } else {
        console.log("User not found");
      }
    } catch (err) {
      console.error("Error setting user online:", err);
    }
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
  socket.on("disconnect", async () => {
    // Find the user associated with this socket ID
    for (const [userId, socketId] of socketMap.entries()) {
      if (socketId === socket.id) {
        // Update the database and remove from onlineUsers
        try {
          const user = await User.findById(userId);
          if (user) {
            user.online = false;
            await user.save();
          }

          onlineUsers.delete(userId);
          socketMap.delete(userId);

          // Notify other users that this user is offline
          io.emit("user-offline", {
            username: user?.username,
            userId,
            online: false,
          });

          console.log("User is now offline:", user?.username);
        } catch (err) {
          console.error("Error setting user offline:", err);
        }
        break;
      }
    }
  });
});

server.listen(3333, () => {
  console.log("Server running at http://localhost:3333");
});
