import prisma from "../config/db.js";

// ─── GET ALL CONVERSATIONS WITH UNREAD COUNTS ───────────
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
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
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Get unread counts for each conversation
    const formatted = await Promise.all(conversations.map(async (c) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          read: false,
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

    // Check existing
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

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetId,
        },
        include: {
          user1: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
          user2: { select: { id: true, fullName: true, role: true, currentTitle: true, companyName: true } },
        },
      });
    }

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: userId },
        read: false,
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

// ─── GET MESSAGES ────────────────────────────────────
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
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    // Mark messages as read when user opens conversation
    const updateResult = await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, read: false },
      data: { read: true },
    });

    // Get updated unread count for this conversation
    const remainingUnread = await prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
    });

    res.json({ 
      messages,
      unreadCleared: updateResult.count,
      remainingUnread
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SEND MESSAGE (REST fallback) ────────────────────
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
      data: { content, conversationId, senderId: userId, read: false },
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

// ─── GET TOTAL UNREAD COUNT FOR NAVBAR ────────────────
export const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map(c => c.id);

    const totalUnread = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        read: false,
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
      },
      data: { read: true },
    });

    res.json({ message: `Marked ${result.count} messages as read` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};