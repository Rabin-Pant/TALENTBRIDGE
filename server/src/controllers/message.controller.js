import prisma from "../config/db.js";

// ─── GET ALL CONVERSATIONS (Only show not soft-deleted by user) ───
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        AND: [
          {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
          {
            NOT: { deletedFor: { has: userId } }, // Don't show soft-deleted conversations
          },
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
          where: {
            NOT: { deletedFor: { has: userId } } // Don't show soft-deleted messages
          }
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = conversations.map((c) => {
      // Count unread messages (not soft-deleted)
      const unreadCount = c.messages.filter(m => 
        m.senderId !== userId && !m.read && !m.deletedFor.includes(userId)
      ).length;

      return {
        id: c.id,
        updatedAt: c.updatedAt,
        otherUser: c.user1Id === userId ? c.user2 : c.user1,
        lastMessage: c.messages[0] || null,
        unreadCount: unreadCount,
      };
    });

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

    console.log("getOrCreateConversation called:", { userId, targetId });

    if (!targetId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, fullName: true }
    });

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing conversation (including soft-deleted ones)
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

    // If conversation exists but was soft-deleted by user, RESTORE it (remove from deletedFor)
    if (conversation && conversation.deletedFor?.includes(userId)) {
      console.log("Conversation was soft-deleted by user, restoring...");
      
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
    // If no conversation exists at all, create a new one
    else if (!conversation) {
      console.log("Creating new conversation...");
      
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

    // Get unread count (excluding soft-deleted messages)
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        read: false,
      },
      select: { deletedFor: true }
    });
    
    const unreadCount = unreadMessages.filter(m => !m.deletedFor.includes(userId)).length;

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
    res.status(500).json({ message: "Server error", error: err.message });
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
      where: {
        conversationId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    // Filter out messages soft-deleted by this user
    const filteredMessages = messages.filter(msg => !msg.deletedFor.includes(userId));

    // Mark messages as read (for messages not soft-deleted)
    for (const msg of filteredMessages) {
      if (msg.senderId !== userId && !msg.read) {
        await prisma.message.update({
          where: { id: msg.id },
          data: { read: true },
        });
      }
    }

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
    const { content } = req.body;
    const userId = req.user.id;

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

// ─── SOFT DELETE MESSAGE (Only for current user) ───
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

    // Soft delete: Add user to deletedFor array
    await prisma.message.update({
      where: { id: messageId },
      data: {
        deletedFor: {
          push: userId
        }
      }
    });

    // Update conversation's updatedAt timestamp
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

// ─── HARD DELETE MESSAGE (Delete for everyone) ───
export const deleteMessageHard = async (req, res) => {
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

    // Only sender can hard delete (delete for everyone)
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages for everyone" });
    }

    // Permanently delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    // Update conversation's updatedAt timestamp
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

// ─── SOFT DELETE CONVERSATION (Only for current user) ───
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

    // Soft delete: Add user to deletedFor array
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        deletedFor: {
          push: userId
        }
      }
    });

    res.json({ message: "Conversation deleted from your side" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET TOTAL UNREAD COUNT FOR SIDEBAR ────────────────
export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        AND: [
          {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
          {
            NOT: { deletedFor: { has: userId } },
          },
        ],
      },
      select: { id: true },
    });

    let totalUnread = 0;
    
    for (const conv of conversations) {
      const unreadMessages = await prisma.message.findMany({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          read: false,
        },
        select: { deletedFor: true }
      });
      totalUnread += unreadMessages.filter(m => !m.deletedFor.includes(userId)).length;
    }

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

    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      select: { id: true, deletedFor: true }
    });

    let count = 0;
    for (const msg of unreadMessages) {
      if (!msg.deletedFor.includes(userId)) {
        await prisma.message.update({
          where: { id: msg.id },
          data: { read: true },
        });
        count++;
      }
    }

    res.json({ message: `Marked ${count} messages as read` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};