import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, getTotalUnreadCount, 
  markConversationRead, deleteMessage, deleteConversation,
} from "../controllers/message.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/conversations",                         getConversations);
router.get("/conversations/:targetId/get-or-create", getOrCreateConversation);
router.get("/unread-count",                          getTotalUnreadCount);
router.get("/:conversationId",                       getMessages);
router.put("/:conversationId/read",                  markConversationRead);
router.post("/:conversationId",                      sendMessage);
router.delete("/message/:messageId",                 deleteMessage);
router.delete("/conversation/:conversationId",       deleteConversation);

export default router;