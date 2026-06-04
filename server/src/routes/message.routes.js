import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/conversations",                         getConversations);
router.get("/conversations/:targetId/get-or-create", getOrCreateConversation);
router.get("/:conversationId",                       getMessages);
router.post("/:conversationId",                      sendMessage);

export default router;