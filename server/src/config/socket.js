import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "./db.js"; // Fixes crash when saving messages to the database

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  // Allow connections from both local development and your Vercel production site
  const allowedOrigins = ["http://localhost:5173", "https://talentbridge-five.vercel.app"];
  if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
    allowedOrigins.push(process.env.CLIENT_URL);
  }

  io = new Server(httpServer, {
    cors: { 
      origin: allowedOrigins, 
      credentials: true 
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 User connected: ${userId}`);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    socket.join(userId);

    socket.on("sendMessage", async ({ conversationId, content }) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });
        if (!conversation) return;

        const message = await prisma.message.create({
          data: { content, conversationId, senderId: userId },
          include: { sender: { select: { id: true, fullName: true } } },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        const receiverId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

        io.to(userId).emit("newMessage", message);
        io.to(receiverId).emit("newMessage", message);
        io.to(receiverId).emit("conversationUpdated", { conversationId });
      } catch (err) {
        console.error("Socket sendMessage error:", err);
      }
    });

    socket.on("typing", ({ conversationId, receiverId }) => {
      io.to(receiverId).emit("userTyping", { conversationId, userId });
    });

    socket.on("stopTyping", ({ conversationId, receiverId }) => {
      io.to(receiverId).emit("userStopTyping", { conversationId, userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};