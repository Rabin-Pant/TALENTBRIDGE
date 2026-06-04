import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage, getTotalUnreadCount, 
  markConversationRead, deleteMessageSoft, deleteMessageHard, deleteConversationSoft,
} from "../controllers/message.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/conversations",                         getConversations);
router.get("/conversations/:targetId/get-or-create", getOrCreateConversation);
router.get("/unread-count",                          getTotalUnreadCount);
router.get("/:conversationId",                       getMessages);
router.put("/:conversationId/read",                  markConversationRead);
router.post("/:conversationId",                      sendMessage);
router.delete("/message/:messageId/soft",            deleteMessageSoft);   // Delete for me only
router.delete("/message/:messageId/hard",            deleteMessageHard);   // Delete for everyone
router.delete("/conversation/:conversationId/soft",  deleteConversationSoft); // Delete conversation for me only

export default router;