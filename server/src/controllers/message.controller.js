import prisma from "../config/db.js";

// --- SECURITY LAYER: Setup DOMPurify for XSS Protection ---
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// ─── GET ALL CONVERSATIONS (FIXED & OPTIMIZED) ────────
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { OR: [{ user1Id: userId }, { user2Id: userId }] },
          { NOT: { deletedFor: { has: userId } } },
        ],
      },
      include: {
        user1: {
          select: { id: true, fullName: true, currentTitle: true, companyName: true, role: true },
        },
        user2: {
          select: { id: true, fullName: true, currentTitle: true, companyName: true, role: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          where: { NOT: { deletedFor: { has: userId } } }
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // --- FIX: Run concurrent precise count aggregates to fix the take:1 count bug ---
    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            read: false,
            NOT: { deletedFor: { has: userId } }
          }
        });

        return {
          id: c.id,
          updatedAt: c.updatedAt,
          otherUser: c.user1Id === userId ? c.user2 : c.user1,
          lastMessage: c.messages[0] || null,
          unreadCount: unreadCount,
        };
      })
    );

    res.json({ conversations: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET OR CREATE CONVERSATION ──────────────────────
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.params;

    if (!targetId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    // --- SECURITY LAYER: Loop Prevention ---
    if (userId === targetId) {
      return res.status(400).json({ message: "You cannot initiate a conversation with yourself" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, fullName: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetId },
          { user1Id: targetId, user2Id: userId },
        ],
      },
      include: {
        user1: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
        user2: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
      },
    });

    if (conversation && conversation.deletedFor?.includes(userId)) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          deletedFor: {
            set: conversation.deletedFor.filter(id => id !== userId)
          },
          updatedAt: new Date()
        },
        include: {
          user1: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
          user2: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
        },
      });
    }
    else if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetId,
          deletedFor: [],
        },
        include: {
          user1: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
          user2: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
        },
      });
    }

    // --- OPTIMIZATION: Scalable direct count check ---
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        read: false,
        NOT: { deletedFor: { has: userId } }
      }
    });

    res.json({
      conversation: {
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        otherUser: conversation.user1Id === userId ? conversation.user2 : conversation.user1,
        unreadCount: unreadCount,
      },
    });
  } catch (err) {
    console.error("getOrCreateConversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET MESSAGES ────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    const filteredMessages = messages.filter(msg => !msg.deletedFor.includes(userId));

    // --- OPTIMIZATION: Replaced iterative loop with single atomic write updateMany ---
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
        NOT: { deletedFor: { has: userId } }
      },
      data: { read: true }
    });

    res.json({ messages: filteredMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SEND MESSAGE ────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    let { content } = req.body;
    const userId = req.user.id;

    // --- SECURITY LAYER: Validation Checks ---
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }
    if (content.length > 10000) {
      return res.status(400).json({ message: "Message length cannot exceed 10,000 characters" });
    }

    // --- SECURITY LAYER: Clean text inputs from persistent XSS payload variants ---
    content = DOMPurify.sanitize(content.trim());

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await prisma.message.create({
      data: { 
        content, 
        conversationId, 
        senderId: userId, 
        read: false,
        deletedFor: [] 
      },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SOFT DELETE MESSAGE ─────────────────────────────
export const deleteMessageSoft = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    if (message.deletedFor.includes(userId)) {
      return res.status(400).json({ message: "Message already deleted" });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { deletedFor: { push: userId } }
    });

    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { updatedAt: new Date() }
    });

    res.json({ message: "Message deleted from your side" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── HARD DELETE MESSAGE ─────────────────────────────
export const deleteMessageHard = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages for everyone" });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { updatedAt: new Date() }
    });

    res.json({ message: "Message deleted for everyone" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SOFT DELETE CONVERSATION ────────────────────────
export const deleteConversationSoft = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ message: "You don't have permission" });
    }

    if (conversation.deletedFor.includes(userId)) {
      return res.status(400).json({ message: "Conversation already deleted" });
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedFor: { push: userId } }
    });

    res.json({ message: "Conversation deleted from your side" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET TOTAL UNREAD COUNT FOR SIDEBAR ──────────────
export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // --- OPTIMIZATION: Drastically reduced complex N+1 loops to exactly 1 high-speed count query ---
    const totalUnread = await prisma.message.count({
      where: {
        senderId: { not: userId },
        read: false,
        NOT: { deletedFor: { has: userId } },
        conversation: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
          NOT: { deletedFor: { has: userId } }
        }
      }
    });

    res.json({ totalUnread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK CONVERSATION AS READ ───────────────────────
export const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // --- OPTIMIZATION: Removed iterative loop block to utilize optimized native updateMany operations ---
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
        NOT: { deletedFor: { has: userId } }
      },
      data: { read: true }
    });

    res.json({ message: `Marked messages as read` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};