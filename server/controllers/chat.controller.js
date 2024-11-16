import Thread from "../models/message.js";

// Function to create a thread between two users
const createThread = async (req, res) => {
  const { user1Id, user2Id } = req.body;
  // Check if a thread already exists between these two users
  let thread = await Thread.findOne({
    $or: [
      { user1: user1Id, user2: user2Id },
      { user1: user2Id, user2: user1Id },
    ],
  });

  // If thread doesn't exist, create a new thread
  if (!thread) {
    thread = new Thread({
      user1: user1Id,
      user2: user2Id,
      messages: [], // Initialize with an empty array of messages
    });

    await thread.save();
    console.log("New thread created between the users.");
  } else {
    console.log("Thread already exists between the users.");
  }

  res.status(201).json(thread); // Return the thread (existing or newly created)
};

// Function to send a new message between two users
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = {
      sender: senderId,
      receiver: receiverId,
      content: content,
      receivedTime: new Date(),
    };

    let thread = await Thread.findOne({
      $or: [
        { user1: senderId, user2: receiverId },
        { user1: receiverId, user2: senderId },
      ],
    });

    if (!thread) {
      // Create new thread if not found
      thread = new Thread({
        user1: senderId,
        user2: receiverId,
        messages: [message],
      });
    } else {
      // Add message to existing thread
      thread.messages.push(message);
    }

    await thread.save();
    console.log("Message sent between the users.");
    res.status(201).json(thread);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Fetch All messages between two users
const fetchMessages = async (req, res) => {
  const { user1Id, user2Id } = req.query;
  try {
    // Find the thread between the two users
    const thread = await Thread.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (!thread) {
      console.log("No thread found between these users.");
      res.status(404).json({ error: "Thread not found" });
    }

    if (thread.messages.length > 0) {
      // Return the messages array from the thread
      const messages = thread.messages.sort(
        (a, b) => a.receivedTime - b.receivedTime
      );
      res.status(200).json(messages);
    } else {
      console.log("No messages found between these users.");
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export { createThread, sendMessage, fetchMessages };
