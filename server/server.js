import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes       from "./src/routes/auth.routes.js";
import seekerRoutes     from "./src/routes/seeker.routes.js";
import employerRoutes   from "./src/routes/employer.routes.js";
import adminRoutes      from "./src/routes/admin.routes.js";
import feedRoutes       from "./src/routes/feed.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import messageRoutes    from "./src/routes/message.routes.js";
import prisma           from "./src/config/db.js";
import jwt              from "jsonwebtoken";

dotenv.config();

const app    = express();
const httpServer = createServer(app);
const io     = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth",        authRoutes);
app.use("/api/seeker",      seekerRoutes);
app.use("/api/employer",    employerRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/feed",        feedRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages",    messageRoutes);

app.get("/", (req, res) => res.json({ message: "TalentBridge API running ✅" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// ─── SOCKET.IO ───────────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

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

  // Broadcast online users
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // Join user to their own room
  socket.join(userId);

  // ── Send Message ──
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

      // Send to both users
      const receiverId = conversation.user1Id === userId
        ? conversation.user2Id
        : conversation.user1Id;

      io.to(userId).emit("newMessage", message);
      io.to(receiverId).emit("newMessage", message);
      io.to(receiverId).emit("conversationUpdated", { conversationId });
    } catch (err) {
      console.error("Socket sendMessage error:", err);
    }
  });

  // ── Typing indicator ──
  socket.on("typing", ({ conversationId, receiverId }) => {
    io.to(receiverId).emit("userTyping", { conversationId, userId });
  });

  socket.on("stopTyping", ({ conversationId, receiverId }) => {
    io.to(receiverId).emit("userStopTyping", { conversationId, userId });
  });

  // ── Disconnect ──
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log(`🔴 User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { io };