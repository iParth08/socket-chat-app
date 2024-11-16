// utils/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3333", {
  transports: ["websocket", "polling"],
}); // Backend URL
export default socket;
