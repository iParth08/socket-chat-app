import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cors from "cors";
import User from "./models/user.js";
import dotenv from "dotenv";

const app = express();
const server = createServer(app);

dotenv.config();
// Configure Socket.IO with CORS options
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend's URL
    methods: ["GET", "POST", "OPTIONS"],
  },
});

// Middleware
app.use(express.json());
app.use(cors("*"));
app.use((req, res, next) => {
  req.io = io; // Attach io to the request object
  next();
});

// Use the routes for user-related actions
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

//test route
app.get("/", (req, res) => {
  res.send("Server is running.");
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
}
connectDB();

// Map to store user IDs and their associated socket IDs
const socketMap = new Map();
const onlineUsers = new Map();

console.log("socketMap", socketMap);
console.log("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  socket.on("online", async (username) => {
    try {
      // Find the user in the database
      const user = await User.findOne({ username });

      if (user) {
        // Update the user's online status in the database
        user.online = true;
        await user.save();

        const userId = user._id.toString();

        // Update onlineUsers and socketMap
        if (!onlineUsers.has(userId) && !socketMap.has(userId)) {
          onlineUsers.set(userId, username);
          socketMap.set(userId, socket.id);

          console.log("onlineUsers", onlineUsers);
          console.log("socketMap", socketMap);
        }
        // socketMap.set(user._id, socket.id);

        // Broadcast only the username of the online user
        io.emit("user-online", { username, userId: userId, online: true });

        // Emit the current online users
        socket.emit(
          "current-online-users",
          Array.from(new Set(onlineUsers.values()))
        );

        console.log("User is now online:", username);
      } else {
        console.log("User not found");
      }
    } catch (err) {
      console.error("Error setting user online:", err);
    }
  });

  //!Redundant Function remove it safely
  // socket.on("login", (userId) => {
  //   userId = userId.toString(); //typecast for safety

  //   if (!userId) {
  //     console.error("Error: userId is required for login.");
  //     return;
  //   }
  //   if (!socketMap.has(userId)) {
  //     socketMap.set(userId, socket.id);
  //   }
  //   console.log(`User ${userId} logged in with socket ID ${socket.id}`);
  // });

  // Event to handle private messaging
  socket.on(
    "private_message",
    ({ senderId, receiverId, message }, callback) => {
      // Typecast for safety
      senderId = senderId.toString();
      receiverId = receiverId.toString();

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
    console.log("discconnected user" + socket.id); //!flag : 01
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

//export
export { io, socketMap };
