import prisma from "../config/db.js";

// ─── GET ALL CONVERSATIONS (Only show conversations not deleted by user) ───
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
            // Only get conversations where user hasn't deleted it
            NOT: { deletedFor: { has: userId } },
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
            // Only show last message if not deleted by user
            NOT: { deletedFor: { has: userId } }
          }
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = await Promise.all(conversations.map(async (c) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          read: false,
          deletedFor: { none: userId } // Don't count messages deleted by user
        },
      });

      return {
        id: c.id,
        updatedAt: c.updatedAt,
        otherUser: c.user1Id === userId ? c.user2 : c.user1,
        lastMessage: c.messages[0] || null,
        unreadCount: unreadCount,
      };
    }));

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

    // Check existing conversation (not deleted by user)
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            OR: [
              { user1Id: userId, user2Id: targetId },
              { user1Id: targetId, user2Id: userId },
            ],
          },
          {
            NOT: { deletedFor: { has: userId } },
          },
        ],
      },
      include: {
        user1: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
        user2: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
      },
    });

    // If conversation exists but is deleted by user, we need to "undelete" it
    if (!conversation) {
      // Check if conversation exists but was deleted by user
      const deletedConversation = await prisma.conversation.findFirst({
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

      if (deletedConversation) {
        // Remove user from deletedFor array (undelete)
        conversation = await prisma.conversation.update({
          where: { id: deletedConversation.id },
          data: {
            deletedFor: {
              set: deletedConversation.deletedFor.filter(id => id !== userId)
            }
          },
          include: {
            user1: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
            user2: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
          },
        });
      } else {
        // Create new conversation
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
    }

    // Get unread count (excluding messages deleted by user)
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        read: false,
        deletedFor: { none: userId }
      },
    });

    res.json({
      conversation: {
        ...conversation,
        otherUser: conversation.user1Id === userId ? conversation.user2 : conversation.user1,
        unreadCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET MESSAGES (Only show messages not deleted by user) ───
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        // Only get messages that aren't deleted by this user
        NOT: { deletedFor: { has: userId } }
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    // Mark messages as read (only for messages not deleted)
    await prisma.message.updateMany({
      where: { 
        conversationId, 
        senderId: { not: userId }, 
        read: false,
        deletedFor: { none: userId }
      },
      data: { read: true },
    });

    res.json({ messages });
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

// ─── DELETE SINGLE MESSAGE (Soft delete - only for current user) ───
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is the sender of the message
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    // Check if message is already deleted by this user
    if (message.deletedFor.includes(userId)) {
      return res.status(400).json({ message: "Message already deleted" });
    }

    // Soft delete: Add user to deletedFor array
    const updatedMessage = await prisma.message.update({
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

    res.json({ message: "Message deleted successfully from your side" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE ENTIRE CONVERSATION (Soft delete - only for current user) ───
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Find the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Check if user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ message: "You don't have permission to delete this conversation" });
    }

    // Check if already deleted by this user
    if (conversation.deletedFor.includes(userId)) {
      return res.status(400).json({ message: "Conversation already deleted" });
    }

    // Soft delete: Add user to deletedFor array
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        deletedFor: {
          push: userId
        }
      }
    });

    res.json({ message: "Conversation deleted from your side successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET TOTAL UNREAD COUNT FOR SIDEBAR ────────────────
export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations where user is a participant and not deleted
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

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages (excluding deleted ones)
    const totalUnread = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        read: false,
        deletedFor: { none: userId }
      },
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

    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
        deletedFor: { none: userId }
      },
      data: { read: true },
    });

    res.json({ message: `Marked ${result.count} messages as read` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};