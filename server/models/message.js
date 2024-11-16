import mongoose from "mongoose";

// Schema for each message
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    receivedTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Schema for a thread between two users
const threadSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema], // Array of messages between these two users
  },
  { timestamps: true }
);

// Model for the thread, storing all messages between the two users
const Thread = mongoose.model("Thread", threadSchema);

export default Thread;
