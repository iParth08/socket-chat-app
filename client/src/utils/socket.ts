// utils/socket.js
import { io } from "socket.io-client";

export const burl = "https://socket-chat-app-vj8d.onrender.com";

const socket = io(burl, {
  transports: ["websocket", "polling"],
}); // Backend URL
export default socket;
