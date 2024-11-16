import express from "express";
import {
  sendMessage,
  createThread,
  fetchMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send-message", sendMessage);
router.post("/create-thread", createThread);
router.get("/fetch-messages", fetchMessages);

export default router;
