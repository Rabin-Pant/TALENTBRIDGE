import prisma from "../config/db.js";

// ─── GET ALL CONVERSATIONS ───────────────────────────
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

    const formatted = conversations.map((c) => ({
      id: c.id,
      updatedAt: c.updatedAt,
      otherUser: c.user1Id === userId ? c.user2 : c.user1,
      lastMessage: c.messages[0] || null,
      unreadCount: 0,
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

    res.json({
      conversation: {
        ...conversation,
        otherUser: conversation.user1Id === userId ? conversation.user2 : conversation.user1,
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

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, read: false },
      data: { read: true },
    });

    res.json({ messages });
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
      data: { content, conversationId, senderId: userId },
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