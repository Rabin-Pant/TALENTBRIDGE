import prisma from "../config/db.js";
import { io } from "../../server.js";

// ─── GET MY CONNECTIONS ──────────────────────────────
export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
      include: {
        sender: {
          select: {
            id: true, fullName: true, currentTitle: true,
            companyName: true, role: true, location: true,
            profilePicture: true,  // ← Add this
          },
        },
        receiver: {
          select: {
            id: true, fullName: true, currentTitle: true,
            companyName: true, role: true, location: true,
            profilePicture: true,  // ← Add this
          },
        },
      },
    });

    const formatted = connections.map((c) => ({
      id: c.id,
      status: c.status,
      createdAt: c.createdAt,
      user: c.senderId === userId ? c.receiver : c.sender,
    }));

    res.json({ connections: formatted });
  } catch (err) {
    console.error("getConnections error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET PENDING REQUESTS ────────────────────────────
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.connection.findMany({
      where: { receiverId: req.user.id, status: "PENDING" },
      include: {
        sender: {
          select: {
            id: true, fullName: true, currentTitle: true,
            companyName: true, role: true, location: true,
            profilePicture: true,  // ← Add this
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ requests });
  } catch (err) {
    console.error("getPendingRequests error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET SUGGESTIONS ─────────────────────────────────
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get existing connections
    const existing = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const excludeIds = [
      userId,
      ...existing.map((c) => (c.senderId === userId ? c.receiverId : c.senderId)),
    ];

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        active: true,
        approved: true,
        role: { in: ["SEEKER", "EMPLOYER"] },
      },
      take: 8,
      select: {
        id: true, fullName: true, currentTitle: true,
        companyName: true, role: true, location: true,
        industry: true,
        profilePicture: true,  // ← Add this
      },
    });

    res.json({ suggestions });
  } catch (err) {
    console.error("getSuggestions error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET CONNECTION STATUS ───────────────────────────
export const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetId },
          { senderId: targetId, receiverId: userId },
        ],
      },
    });

    res.json({
      status: connection?.status || "NONE",
      connectionId: connection?.id || null,
      isSender: connection?.senderId === userId,
    });
  } catch (err) {
    console.error("getConnectionStatus error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── SEND CONNECTION REQUEST ──────────────────────────
export const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Connection already exists", status: existing.status });
    }

    const connection = await prisma.connection.create({
      data: { senderId, receiverId },
    });

    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { fullName: true },
    });

    // Create notification in database
    const notification = await prisma.notification.create({
  data: {
    recipientId: receiverId,
    title: "New Connection Request",
    message: `${sender.fullName} sent you a connection request`,
    type: "SYSTEM",
    link: "/network",
  },
});

    // Emit real-time notification
    io.to(receiverId).emit("newNotification", notification);

    res.status(201).json({ message: "Connection request sent", connection });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── RESPOND TO REQUEST ──────────────────────────────
export const respondRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection || connection.receiverId !== req.user.id) {
      return res.status(404).json({ message: "Request not found" });
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" },
    });

    if (action === "ACCEPT") {
      const receiver = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { fullName: true },
      });

      const notification = await prisma.notification.create({
        data: {
          recipientId: connection.senderId,
          title: "Connection Accepted!",
          message: `${receiver.fullName} accepted your connection request`,
          type: "SYSTEM",
          link: "/network",
        },
      });

      io.to(connection.senderId).emit("newNotification", notification);
    }

    res.json({ message: `Request ${action === "ACCEPT" ? "accepted" : "declined"}`, connection: updated });
  } catch (err) {
    console.error("respondRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── REMOVE CONNECTION ───────────────────────────────
export const removeConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection || (connection.senderId !== userId && connection.receiverId !== userId)) {
      return res.status(404).json({ message: "Connection not found" });
    }

    await prisma.connection.delete({ where: { id } });
    res.json({ message: "Connection removed" });
  } catch (err) {
    console.error("removeConnection error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET PUBLIC PROFILE ───────────────────────────────
export const getPublicProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true, fullName: true, role: true,
        currentTitle: true, bio: true, location: true,
        experienceLevel: true, skills: true,
        resumeFileName: true, education: true,
        workExperience: true, companyName: true,
        companyWebsite: true, companySize: true,
        industry: true, companyDescription: true,
        profilePicture: true, 
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};