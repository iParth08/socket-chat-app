import React, { useEffect, useState } from "react";
import socket, { burl } from "../utils/socket";
import axios from "axios";

// Define the types for messages
type Message = {
  sender: string; // The ID of the sender
  receiver: string; // The ID of the receiver
  content: string; // The content of the message
  receivedTime: Date;
};

// Define the props for the Chat component
interface ChatProps {
  userId: string;
  friendId: string;
}

const ChatBox: React.FC<ChatProps> = ({ userId, friendId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  //save message
  const saveMessage = async (
    senderId: string,
    receiverId: string,
    content: string
  ) => {
    try {
      const response = await axios.post(`${burl}/api/chats/send-message`, {
        senderId,
        receiverId,
        content,
      });
      console.log("Message saved:", response.data);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  useEffect(() => {
    //Create a thread
    const createThreadAndFetchMessages = async () => {
      // establishing connection
      console.log("Creating thread between", userId, "and", friendId);
      try {
        // Create a thread or get an existing one
        const newThread = await axios.post(`${burl}/api/chats/create-thread`, {
          user1Id: userId,
          user2Id: friendId,
        });

        if (newThread) {
          console.log("Thread created:", newThread.data);
        } else {
          console.log("Thread not created");
        }

        // fetch Messages for initial screen
        const response = await axios.get(`${burl}/api/chats/fetch-messages`, {
          params: {
            user1Id: userId,
            user2Id: friendId,
          },
        });

        if (response.data) {
          console.log("Messages fetched:", response.data);
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };

    // Listen for incoming messages
    socket.on("new_message", (data: { senderId: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: data.senderId,
          receiver: userId,
          content: data.message,
          receivedTime: new Date(),
        },
      ]);
    });

    createThreadAndFetchMessages(); // Create the thread as soon as it mounts

    return () => {
      socket.off("new_message");
    };
  }, [userId, friendId]);

  const sendMessage = () => {
    if (message.trim()) {
      // Emit private message event
      socket.emit("private_message", {
        senderId: userId,
        receiverId: friendId,
        message,
      });

      // Add message to local state for immediate UI update
      saveMessage(userId, friendId, message);
      setMessages((prev) => [
        ...prev,
        {
          sender: userId,
          receiver: friendId,
          content: message,
          receivedTime: new Date(),
        },
      ]);
      setMessage(""); // Clear input field
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default behavior (like new line)
      sendMessage(); // Trigger send message on Enter key
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen p-4 bg-white shadow-lg rounded-lg">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === userId ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-left ${
                msg.sender === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {msg.content} <br />
              <span className="ml-2 text-xs">
                {msg.receivedTime.toLocaleTimeString()}
              </span>
              {/* //!remove it */}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Attach keydown event listener
          placeholder="Type your message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
